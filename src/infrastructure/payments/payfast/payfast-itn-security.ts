import { createHash, timingSafeEqual } from "crypto";
import { isIP } from "net";

export type PayFastItnEnvironment = "SANDBOX" | "LIVE";

export interface PayFastItnField {
  readonly name: string;
  readonly value: string;
}

export class PayFastItnRequestError extends Error {
  public constructor(
    public readonly statusCode: 400 | 403 | 409 | 503,
    message: string,
  ) {
    super(message);
    this.name = "PayFastItnRequestError";
  }
}

export const PAYFAST_ITN_SOURCE_CIDRS = Object.freeze([
  "197.97.145.144/28",
  "41.74.179.192/27",
  "102.216.36.0/28",
  "102.216.36.128/28",
] as const);
export const PAYFAST_ITN_SOURCE_IPV4 = "144.126.193.139";
export const PAYFAST_ITN_SOURCE_DOCUMENTATION = "https://developers.payfast.co.za/docs#ports_and_ip_addresses";

function encodeItnValue(value: string): string {
  return Array.from(Buffer.from(value.trim(), "utf8"), (byte) => {
    const alphaNumeric = (byte >= 0x30 && byte <= 0x39)
      || (byte >= 0x41 && byte <= 0x5a)
      || (byte >= 0x61 && byte <= 0x7a);
    if (alphaNumeric || byte === 0x2d || byte === 0x2e || byte === 0x5f) return String.fromCharCode(byte);
    if (byte === 0x20) return "+";
    return `%${byte.toString(16).padStart(2, "0").toUpperCase()}`;
  }).join("");
}

export function parsePayFastItnFields(rawBody: Buffer): ReadonlyArray<PayFastItnField> {
  let body: string;
  try {
    body = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
  } catch {
    throw new PayFastItnRequestError(400, "Malformed notification encoding.");
  }
  if (!body || /%(?![0-9a-fA-F]{2})/.test(body)) {
    throw new PayFastItnRequestError(400, "Malformed notification form data.");
  }

  const fields: PayFastItnField[] = [];
  const names = new Set<string>();
  for (const [name, value] of new URLSearchParams(body)) {
    if (!name || names.has(name)) throw new PayFastItnRequestError(400, "Duplicate or empty notification field.");
    if (name.toLowerCase() === "passphrase") throw new PayFastItnRequestError(400, "Unexpected notification field.");
    names.add(name);
    fields.push(Object.freeze({ name, value }));
  }
  return Object.freeze(fields);
}

export function createPayFastItnSignature(fields: ReadonlyArray<PayFastItnField>, passphrase: string): string {
  const payload = fields
    .filter(({ name, value }) => name !== "signature" && value.trim().length > 0)
    .map(({ name, value }) => `${name}=${encodeItnValue(value)}`)
    .join("&");
  const input = passphrase.trim().length > 0
    ? `${payload}&passphrase=${encodeItnValue(passphrase)}`
    : payload;
  return createHash("md5").update(input).digest("hex");
}

export function verifyPayFastItnSignature(
  fields: ReadonlyArray<PayFastItnField>,
  passphrase: string,
): boolean {
  const supplied = fields.find(({ name }) => name === "signature")?.value;
  if (!supplied || !/^[a-f0-9]{32}$/i.test(supplied)) return false;
  const expected = createPayFastItnSignature(fields, passphrase);
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(supplied, "hex"));
}

function parseIpv4(value: string): number | undefined {
  if (isIP(value) !== 4) return undefined;
  const octets = value.split(".").map(Number);
  return (((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0);
}

function normalizePeerAddress(address: string): string | undefined {
  const normalized = address.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 4) return normalized;
  if (isIP(normalized) !== 6) return undefined;
  if (!normalized.startsWith("::ffff:")) return undefined;
  const mapped = normalized.slice(7);
  if (isIP(mapped) === 4) return mapped;
  const words = mapped.split(":");
  if (words.length !== 2 || !words.every((word) => /^[a-f0-9]{1,4}$/.test(word))) return undefined;
  const high = Number.parseInt(words[0]!, 16);
  const low = Number.parseInt(words[1]!, 16);
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

function isInCidr(address: string, cidr: string): boolean {
  const [networkText, prefixText] = cidr.split("/");
  const ip = parseIpv4(address);
  const network = networkText ? parseIpv4(networkText) : undefined;
  const prefix = Number(prefixText);
  if (ip === undefined || network === undefined || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ip & mask) === (network & mask);
}

export function isPayFastItnSourceAddress(peerAddress: string): boolean {
  const normalized = normalizePeerAddress(peerAddress);
  if (!normalized) return false;
  if (normalized === PAYFAST_ITN_SOURCE_IPV4) return true;
  return PAYFAST_ITN_SOURCE_CIDRS.some((cidr) => isInCidr(normalized, cidr));
}

export interface PayFastItnServerValidator {
  validate(rawBody: Buffer, environment: PayFastItnEnvironment): Promise<boolean>;
}

export class FetchPayFastItnServerValidator implements PayFastItnServerValidator {
  public constructor(
    private readonly timeoutMs: number = 10000,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  public async validate(rawBody: Buffer, environment: PayFastItnEnvironment): Promise<boolean> {
    const host = environment === "SANDBOX"
      ? "https://sandbox.payfast.co.za/eng/query/validate"
      : "https://www.payfast.co.za/eng/query/validate";
    let response: Response;
    try {
      response = await this.fetchImplementation(host, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new Uint8Array(rawBody),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
    }
    let responseBody: string;
    try {
      responseBody = await response.text();
    } catch {
      throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
    }
    if (!response.ok) throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
    return responseBody.trim() === "VALID";
  }
}

export function hashPayFastItnBody(rawBody: Buffer): string {
  return createHash("sha256").update(rawBody).digest("hex");
}
