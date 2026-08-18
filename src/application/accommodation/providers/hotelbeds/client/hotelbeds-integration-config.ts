export enum HotelbedsEnvironment {
  TEST = "TEST",
  PRODUCTION = "PRODUCTION",
}

export interface HotelbedsIntegrationConfig {
  readonly environment: HotelbedsEnvironment;
  readonly apiKey: string;
  readonly secret: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly selectedHotelCodes?: ReadonlyArray<string>;
  readonly contentBatchSize?: number;
  readonly contentMaxQps?: number;
  readonly contentMaxRetries?: number;
  readonly contentRetryBaseDelayMs?: number;
}

export class HotelbedsConfigurationError extends Error {
  public readonly code = "CONFIGURATION_ERROR";

  public constructor(message: string) {
    super(message);
    this.name = "HotelbedsConfigurationError";
  }
}

const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_CONTENT_BATCH_SIZE = 50;
export const DEFAULT_CONTENT_MAX_QPS = 1;
export const DEFAULT_CONTENT_MAX_RETRIES = 3;
export const DEFAULT_CONTENT_RETRY_BASE_DELAY_MS = 1000;
const DEFAULT_BASE_URLS: Record<HotelbedsEnvironment, string> = {
  [HotelbedsEnvironment.TEST]: "https://api.test.hotelbeds.com",
  [HotelbedsEnvironment.PRODUCTION]: "https://api.hotelbeds.com",
};

function isBlank(value: string | undefined): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function parseEnvironment(rawEnvironment: string | undefined, nodeEnvironment: string | undefined): HotelbedsEnvironment {
  const candidate = rawEnvironment?.trim().toUpperCase();

  if (candidate === HotelbedsEnvironment.TEST || candidate === HotelbedsEnvironment.PRODUCTION) {
    return candidate;
  }

  if (nodeEnvironment?.trim().toLowerCase() === "production") {
    return HotelbedsEnvironment.PRODUCTION;
  }

  return HotelbedsEnvironment.TEST;
}

function parseTimeout(rawTimeout: string | undefined): number {
  if (!rawTimeout || rawTimeout.trim().length === 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number.parseInt(rawTimeout, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new HotelbedsConfigurationError("HOTELBEDS_TIMEOUT_MS must be a positive integer.");
  }

  return parsed;
}

function parsePositiveInteger(rawValue: string | undefined, fallback: number, variableName: string): number {
  if (!rawValue || rawValue.trim().length === 0) return fallback;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HotelbedsConfigurationError(`${variableName} must be a positive integer.`);
  }
  return parsed;
}

function parseNonNegativeInteger(rawValue: string | undefined, fallback: number, variableName: string): number {
  if (!rawValue || rawValue.trim().length === 0) return fallback;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HotelbedsConfigurationError(`${variableName} must be a non-negative integer.`);
  }
  return parsed;
}

function validateUrl(value: string): string {
  try {
    const parsed = new URL(value);
    if (!parsed.protocol || !parsed.hostname) {
      throw new Error("Invalid URL");
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    throw new HotelbedsConfigurationError("HOTELBEDS_BASE_URL must be a valid absolute URL.");
  }
}

function parseSelectedHotelCodes(rawCodes: string | undefined): ReadonlyArray<string> {
  if (!rawCodes || rawCodes.trim().length === 0) {
    return [];
  }

  return Object.freeze(
    [...new Set(rawCodes.split(",").map((code) => code.trim()).filter((code) => code.length > 0))],
  );
}

export function createHotelbedsIntegrationConfig(input: HotelbedsIntegrationConfig): HotelbedsIntegrationConfig {
  if (isBlank(input.apiKey)) {
    throw new HotelbedsConfigurationError("Hotelbeds API key is required.");
  }

  if (isBlank(input.secret)) {
    throw new HotelbedsConfigurationError("Hotelbeds API secret is required.");
  }

  if (!input.timeoutMs || input.timeoutMs <= 0) {
    throw new HotelbedsConfigurationError("Hotelbeds timeout must be greater than zero.");
  }

  return Object.freeze({
    environment: input.environment,
    apiKey: input.apiKey.trim(),
    secret: input.secret.trim(),
    baseUrl: validateUrl(input.baseUrl),
    timeoutMs: input.timeoutMs,
    selectedHotelCodes: Object.freeze([...(input.selectedHotelCodes ?? [])]),
    contentBatchSize: input.contentBatchSize ?? DEFAULT_CONTENT_BATCH_SIZE,
    contentMaxQps: input.contentMaxQps ?? DEFAULT_CONTENT_MAX_QPS,
    contentMaxRetries: input.contentMaxRetries ?? DEFAULT_CONTENT_MAX_RETRIES,
    contentRetryBaseDelayMs: input.contentRetryBaseDelayMs ?? DEFAULT_CONTENT_RETRY_BASE_DELAY_MS,
  });
}

export function loadHotelbedsIntegrationConfig(env: NodeJS.ProcessEnv = process.env): HotelbedsIntegrationConfig {
  const environment = parseEnvironment(env.HOTELBEDS_ENV, env.NODE_ENV);
  const baseUrl = env.HOTELBEDS_BASE_URL ?? DEFAULT_BASE_URLS[environment];

  return createHotelbedsIntegrationConfig({
    environment,
    apiKey: env.HOTELBEDS_API_KEY ?? "",
    secret: env.HOTELBEDS_SECRET ?? "",
    baseUrl,
    timeoutMs: parseTimeout(env.HOTELBEDS_TIMEOUT_MS),
    selectedHotelCodes: parseSelectedHotelCodes(env.HOTELBEDS_SELECTED_HOTEL_CODES),
    contentBatchSize: parsePositiveInteger(env.HOTELBEDS_CONTENT_BATCH_SIZE, DEFAULT_CONTENT_BATCH_SIZE, "HOTELBEDS_CONTENT_BATCH_SIZE"),
    contentMaxQps: parsePositiveInteger(env.HOTELBEDS_CONTENT_MAX_QPS, DEFAULT_CONTENT_MAX_QPS, "HOTELBEDS_CONTENT_MAX_QPS"),
    contentMaxRetries: parseNonNegativeInteger(env.HOTELBEDS_CONTENT_MAX_RETRIES, DEFAULT_CONTENT_MAX_RETRIES, "HOTELBEDS_CONTENT_MAX_RETRIES"),
    contentRetryBaseDelayMs: parsePositiveInteger(env.HOTELBEDS_CONTENT_RETRY_BASE_DELAY_MS, DEFAULT_CONTENT_RETRY_BASE_DELAY_MS, "HOTELBEDS_CONTENT_RETRY_BASE_DELAY_MS"),
  });
}