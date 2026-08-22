export function generateReservationNumber(now: () => number = Date.now, random: () => number = Math.random): string {
  const prefix = "RES";
  const timestamp = now().toString().slice(-6);
  const randomToken = random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomToken}`;
}
