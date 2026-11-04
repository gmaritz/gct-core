import { loadAccommodationFulfilmentMode } from "./accommodation-fulfilment.config";
import { AccommodationFulfilmentMode } from "../application/reservations/service/accommodation-fulfilment-mode";

describe("loadAccommodationFulfilmentMode", () => {
  it("defaults to LIVE", () => {
    expect(loadAccommodationFulfilmentMode({ NODE_ENV: "development" })).toBe(AccommodationFulfilmentMode.LIVE);
  });

  it.each(["development", "test"])("allows SIMULATED in %s", (environment) => {
    expect(loadAccommodationFulfilmentMode({
      NODE_ENV: environment,
      ACCOMMODATION_FULFILMENT_MODE: "simulated",
    })).toBe(AccommodationFulfilmentMode.SIMULATED);
  });

  it("rejects SIMULATED in production before application startup", () => {
    expect(() => loadAccommodationFulfilmentMode({
      NODE_ENV: "production",
      ACCOMMODATION_FULFILMENT_MODE: "SIMULATED",
    })).toThrow("only permitted in development or test");
  });

  it("rejects unknown mode values", () => {
    expect(() => loadAccommodationFulfilmentMode({
      NODE_ENV: "development",
      ACCOMMODATION_FULFILMENT_MODE: "MOCK",
    })).toThrow("must be LIVE or SIMULATED");
  });
});
