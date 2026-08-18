import {
  DEFAULT_CONTENT_BATCH_SIZE,
  DEFAULT_CONTENT_MAX_QPS,
  DEFAULT_CONTENT_MAX_RETRIES,
  DEFAULT_CONTENT_RETRY_BASE_DELAY_MS,
  loadHotelbedsIntegrationConfig,
} from "./client";

describe("Hotelbeds content synchronization configuration", () => {
  it("uses safe defaults", () => {
    const config = loadHotelbedsIntegrationConfig({
      HOTELBEDS_API_KEY: "key",
      HOTELBEDS_SECRET: "secret",
    });
    expect(config.contentBatchSize).toBe(DEFAULT_CONTENT_BATCH_SIZE);
    expect(config.contentMaxQps).toBe(DEFAULT_CONTENT_MAX_QPS);
    expect(config.contentMaxRetries).toBe(DEFAULT_CONTENT_MAX_RETRIES);
    expect(config.contentRetryBaseDelayMs).toBe(DEFAULT_CONTENT_RETRY_BASE_DELAY_MS);
  });

  it("reads content settings from the environment", () => {
    const config = loadHotelbedsIntegrationConfig({
      HOTELBEDS_API_KEY: "key",
      HOTELBEDS_SECRET: "secret",
      HOTELBEDS_CONTENT_BATCH_SIZE: "25",
      HOTELBEDS_CONTENT_MAX_QPS: "2",
      HOTELBEDS_CONTENT_MAX_RETRIES: "4",
      HOTELBEDS_CONTENT_RETRY_BASE_DELAY_MS: "250",
    });
    expect(config).toMatchObject({
      contentBatchSize: 25,
      contentMaxQps: 2,
      contentMaxRetries: 4,
      contentRetryBaseDelayMs: 250,
    });
  });
});
