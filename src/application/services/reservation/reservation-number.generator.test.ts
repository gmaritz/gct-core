import { generateReservationNumber } from "./reservation-number.generator";

describe("generateReservationNumber", () => {
  it("reuses the existing RES-timestamp-random convention", () => {
    const reservationNumber = generateReservationNumber(() => 1723370000123, () => 0.123456789);

    expect(reservationNumber).toMatch(/^RES-\d{6}-[A-Z0-9]{4}$/);
  });

  it("is deterministic for injected clocks and random sources", () => {
    const reservationNumber = generateReservationNumber(() => 1723370000123, () => 0.123456789);

    expect(reservationNumber).toBe("RES-000123-4FZZ");
  });
});
