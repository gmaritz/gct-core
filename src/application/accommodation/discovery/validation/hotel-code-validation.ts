const MAX_SAFE_HOTEL_CODE = BigInt(Number.MAX_SAFE_INTEGER);

export function isValidExplicitHotelCode(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const code = value.trim();
  if (!/^\d+$/.test(code)) {
    return false;
  }

  const asBigInt = BigInt(code);
  return asBigInt > 0n && asBigInt <= MAX_SAFE_HOTEL_CODE;
}
