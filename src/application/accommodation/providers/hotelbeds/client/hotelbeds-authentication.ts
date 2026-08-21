import { createHash } from "crypto";

import {
  HotelbedsIntegrationConfig,
  loadHotelbedsIntegrationConfig,
} from "./hotelbeds-integration-config";
import { HotelbedsRequest } from "./hotelbeds-request";

export interface HotelbedsClock {
  now(): Date;
}

export class SystemHotelbedsClock implements HotelbedsClock {
  public now(): Date {
    return new Date();
  }
}

export interface HotelbedsAuthentication {
  prepareHeaders(
    request: HotelbedsRequest,
    context?: { readonly correlationId?: string; readonly requestId?: string },
  ): Readonly<Record<string, string>>;
}

function createSignature(apiKey: string, secret: string, timestamp: string): string {
  return createHash("sha256").update(`${apiKey}${secret}${timestamp}`).digest("hex");
}

export class DefaultHotelbedsAuthentication implements HotelbedsAuthentication {
  public constructor(
    private readonly configLoader: () => HotelbedsIntegrationConfig = (): HotelbedsIntegrationConfig =>
      loadHotelbedsIntegrationConfig(),
    private readonly clock: HotelbedsClock = new SystemHotelbedsClock(),
  ) {}

  public prepareHeaders(
    request: HotelbedsRequest,
    context?: { readonly correlationId?: string; readonly requestId?: string },
  ): Readonly<Record<string, string>> {
    const config = this.configLoader();
    const timestamp = Math.floor(this.clock.now().getTime() / 1000).toString();
    const signature = createSignature(config.apiKey, config.secret, timestamp);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Api-key": config.apiKey,
      "X-Signature": signature,
      "X-Timestamp": timestamp,
      "X-GCT-Operation": request.operation,
    };

    if (context?.correlationId) {
      headers["X-Correlation-Id"] = context.correlationId;
    }

    if (context?.requestId) {
      headers["X-Request-Id"] = context.requestId;
    }

    return Object.freeze(headers);
  }
}

export function createHotelbedsSignature(
  apiKey: string,
  secret: string,
  timestamp: string,
): string {
  return createSignature(apiKey, secret, timestamp);
}