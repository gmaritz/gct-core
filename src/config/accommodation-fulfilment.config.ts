import { AccommodationFulfilmentMode } from "../application/reservations/service/accommodation-fulfilment-mode";

export function loadAccommodationFulfilmentMode(
  env: NodeJS.ProcessEnv = process.env,
): AccommodationFulfilmentMode {
  const configuredMode = env.ACCOMMODATION_FULFILMENT_MODE?.trim().toUpperCase() || AccommodationFulfilmentMode.LIVE;
  const mode = Object.values(AccommodationFulfilmentMode)
    .find((candidate) => candidate === configuredMode);
  if (!mode) {
    throw new Error("ACCOMMODATION_FULFILMENT_MODE must be LIVE or SIMULATED.");
  }

  const environment = (env.NODE_ENV ?? "development").trim().toLowerCase();
  if (
    mode === AccommodationFulfilmentMode.SIMULATED
    && environment !== "development"
    && environment !== "test"
  ) {
    throw new Error("SIMULATED accommodation fulfilment is only permitted in development or test.");
  }

  return mode;
}
