import { Request, Response } from "express";
import {
  PaymentAttemptNotificationConflictError,
  PaymentAttemptNotFoundError,
} from "../../../application/payments";
import { createPayFastItnProcessor } from "../../../infrastructure/payments/payfast/payfast-itn-factory";
import { PayFastItnRequestError } from "../../../infrastructure/payments/payfast/payfast-itn-security";
import { getLogger } from "../../../bootstrap/logging";

function requestCorrelationId(request: Request): string {
  return (request as Request & { readonly requestId?: string }).requestId ?? "unknown";
}

export function resolvePayFastItnPeerAddress(
  request: Request,
  trustedProxyAddresses: ReadonlyArray<string> = [],
): string {
  const peerAddress = request.socket.remoteAddress ?? "";
  const normalizedPeer = peerAddress.toLowerCase().replace(/^::ffff:/, "");
  const trustedPeers = new Set(trustedProxyAddresses.map((address) => address.trim().toLowerCase().replace(/^::ffff:/, "")));
  if (!trustedPeers.has(normalizedPeer)) return peerAddress;

  const forwardedFor = request.header("X-Forwarded-For")?.trim();
  if (!forwardedFor || forwardedFor.includes(",")) return "";
  return forwardedFor;
}

export async function receivePayFastItn(request: Request, response: Response): Promise<void> {
  if (!request.is("application/x-www-form-urlencoded")) {
    getLogger().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "content_type" });
    response.status(415).type("text/plain").send("Unsupported notification format.");
    return;
  }
  if (!Buffer.isBuffer(request.body)) {
    getLogger().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "body_format" });
    response.status(400).type("text/plain").send("Malformed payment notification.");
    return;
  }

  try {
    const trustedProxyAddresses = process.env.PAYFAST_ITN_TRUSTED_PROXY_IPS?.split(",").map((address) => address.trim()).filter(Boolean) ?? [];
    await createPayFastItnProcessor().process(request.body, resolvePayFastItnPeerAddress(request, trustedProxyAddresses));
    getLogger().info("payfast_itn_processed", { requestId: requestCorrelationId(request), outcome: "accepted" });
    response.status(200).type("text/plain").send("OK");
  } catch (error) {
    if (error instanceof PayFastItnRequestError) {
      getLogger().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: `validation_${error.statusCode}` });
      response.status(error.statusCode).type("text/plain").send(error.message);
      return;
    }
    if (error instanceof PaymentAttemptNotFoundError) {
      getLogger().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "unmatched_attempt" });
      response.status(404).type("text/plain").send("Payment notification could not be correlated.");
      return;
    }
    if (error instanceof PaymentAttemptNotificationConflictError) {
      getLogger().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "state_conflict" });
      response.status(409).type("text/plain").send("Payment notification conflicts with the current payment state.");
      return;
    }
    getLogger().error("payfast_itn_processing_failed", { requestId: requestCorrelationId(request), outcome: "transient_failure" });
    response.status(503).type("text/plain").send("Payment notification processing is temporarily unavailable.");
  }
}
