"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchPayFastItnServerValidator = exports.PAYFAST_ITN_SOURCE_DOCUMENTATION = exports.PAYFAST_ITN_SOURCE_IPV4 = exports.PAYFAST_ITN_SOURCE_CIDRS = exports.PayFastItnRequestError = void 0;
exports.parsePayFastItnFields = parsePayFastItnFields;
exports.createPayFastItnSignature = createPayFastItnSignature;
exports.verifyPayFastItnSignature = verifyPayFastItnSignature;
exports.isPayFastItnSourceAddress = isPayFastItnSourceAddress;
exports.hashPayFastItnBody = hashPayFastItnBody;
const crypto_1 = require("crypto");
const net_1 = require("net");
class PayFastItnRequestError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "PayFastItnRequestError";
    }
}
exports.PayFastItnRequestError = PayFastItnRequestError;
exports.PAYFAST_ITN_SOURCE_CIDRS = Object.freeze([
    "197.97.145.144/28",
    "41.74.179.192/27",
    "102.216.36.0/28",
    "102.216.36.128/28",
]);
exports.PAYFAST_ITN_SOURCE_IPV4 = "144.126.193.139";
exports.PAYFAST_ITN_SOURCE_DOCUMENTATION = "https://developers.payfast.co.za/docs#ports_and_ip_addresses";
function encodeItnValue(value) {
    return Array.from(Buffer.from(value.trim(), "utf8"), (byte) => {
        const alphaNumeric = (byte >= 0x30 && byte <= 0x39)
            || (byte >= 0x41 && byte <= 0x5a)
            || (byte >= 0x61 && byte <= 0x7a);
        if (alphaNumeric || byte === 0x2d || byte === 0x2e || byte === 0x5f)
            return String.fromCharCode(byte);
        if (byte === 0x20)
            return "+";
        return `%${byte.toString(16).padStart(2, "0").toUpperCase()}`;
    }).join("");
}
function parsePayFastItnFields(rawBody) {
    let body;
    try {
        body = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    }
    catch {
        throw new PayFastItnRequestError(400, "Malformed notification encoding.");
    }
    if (!body || /%(?![0-9a-fA-F]{2})/.test(body)) {
        throw new PayFastItnRequestError(400, "Malformed notification form data.");
    }
    const fields = [];
    const names = new Set();
    for (const [name, value] of new URLSearchParams(body)) {
        if (!name || names.has(name))
            throw new PayFastItnRequestError(400, "Duplicate or empty notification field.");
        if (name.toLowerCase() === "passphrase")
            throw new PayFastItnRequestError(400, "Unexpected notification field.");
        names.add(name);
        fields.push(Object.freeze({ name, value }));
    }
    return Object.freeze(fields);
}
function createPayFastItnSignature(fields, passphrase) {
    const payload = fields
        .filter(({ name, value }) => name !== "signature" && value.trim().length > 0)
        .map(({ name, value }) => `${name}=${encodeItnValue(value)}`)
        .join("&");
    const input = passphrase.trim().length > 0
        ? `${payload}&passphrase=${encodeItnValue(passphrase)}`
        : payload;
    return (0, crypto_1.createHash)("md5").update(input).digest("hex");
}
function verifyPayFastItnSignature(fields, passphrase) {
    const supplied = fields.find(({ name }) => name === "signature")?.value;
    if (!supplied || !/^[a-f0-9]{32}$/i.test(supplied))
        return false;
    const expected = createPayFastItnSignature(fields, passphrase);
    return (0, crypto_1.timingSafeEqual)(Buffer.from(expected, "hex"), Buffer.from(supplied, "hex"));
}
function parseIpv4(value) {
    if ((0, net_1.isIP)(value) !== 4)
        return undefined;
    const octets = value.split(".").map(Number);
    return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}
function normalizePeerAddress(address) {
    const normalized = address.trim().toLowerCase().replace(/^\[|\]$/g, "");
    if ((0, net_1.isIP)(normalized) === 4)
        return normalized;
    if ((0, net_1.isIP)(normalized) !== 6)
        return undefined;
    if (!normalized.startsWith("::ffff:"))
        return undefined;
    const mapped = normalized.slice(7);
    if ((0, net_1.isIP)(mapped) === 4)
        return mapped;
    const words = mapped.split(":");
    if (words.length !== 2 || !words.every((word) => /^[a-f0-9]{1,4}$/.test(word)))
        return undefined;
    const high = Number.parseInt(words[0], 16);
    const low = Number.parseInt(words[1], 16);
    return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}
function isInCidr(address, cidr) {
    const [networkText, prefixText] = cidr.split("/");
    const ip = parseIpv4(address);
    const network = networkText ? parseIpv4(networkText) : undefined;
    const prefix = Number(prefixText);
    if (ip === undefined || network === undefined || !Number.isInteger(prefix) || prefix < 0 || prefix > 32)
        return false;
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (ip & mask) === (network & mask);
}
function isPayFastItnSourceAddress(peerAddress) {
    const normalized = normalizePeerAddress(peerAddress);
    if (!normalized)
        return false;
    if (normalized === exports.PAYFAST_ITN_SOURCE_IPV4)
        return true;
    return exports.PAYFAST_ITN_SOURCE_CIDRS.some((cidr) => isInCidr(normalized, cidr));
}
class FetchPayFastItnServerValidator {
    constructor(timeoutMs = 10000, fetchImplementation = fetch) {
        this.timeoutMs = timeoutMs;
        this.fetchImplementation = fetchImplementation;
    }
    async validate(rawBody, environment) {
        const host = environment === "SANDBOX"
            ? "https://sandbox.payfast.co.za/eng/query/validate"
            : "https://www.payfast.co.za/eng/query/validate";
        let response;
        try {
            response = await this.fetchImplementation(host, {
                method: "POST",
                headers: { "content-type": "application/x-www-form-urlencoded" },
                body: new Uint8Array(rawBody),
                signal: AbortSignal.timeout(this.timeoutMs),
            });
        }
        catch {
            throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
        }
        let responseBody;
        try {
            responseBody = await response.text();
        }
        catch {
            throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
        }
        if (!response.ok)
            throw new PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
        return responseBody.trim() === "VALID";
    }
}
exports.FetchPayFastItnServerValidator = FetchPayFastItnServerValidator;
function hashPayFastItnBody(rawBody) {
    return (0, crypto_1.createHash)("sha256").update(rawBody).digest("hex");
}
//# sourceMappingURL=payfast-itn-security.js.map