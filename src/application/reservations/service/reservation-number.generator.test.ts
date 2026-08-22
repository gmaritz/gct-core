import { generateReservationNumber } from "./reservation-number.generator";

describe("canonical reservation number generator", () => {
  it("uses the established RES-timestamp-token convention", () => {
    const value = generateReservationNumber(() => 1723370000123, () => 0.123456789);

    expect(value).toBe("RES-000123-4FZZ");
  });

  it("produces a reservation number distinct from technical identity formats", () => {
    const value = generateReservationNumber(() => 1723370000123, () => 0.123456789);

    expect(value).toMatch(/^RES-\d{6}-[A-Z0-9]{4}$/);
    expect(value).not.toBe("reservation-001");
  });
});
