import { generateKeyPairSync } from "crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import {
  HotelbedsConfigurationError,
  HotelbedsEnvironment,
  loadHotelbedsIntegrationConfig,
} from "../../../application/accommodation";
import { loadHotelbedsFileIntegrationConfig } from "./hotelbeds-runtime";

const TEST_PASSPHRASE = "test-key-passphrase";
const TEST_PRIVATE_KEY = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
}).privateKey;
const TEST_ENCRYPTED_PRIVATE_KEY = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: TEST_PASSPHRASE,
  },
}).privateKey;
const TEST_CERTIFICATE = "-----BEGIN CERTIFICATE-----\ntest certificate\n-----END CERTIFICATE-----\n";
const TEST_CA = "-----BEGIN CERTIFICATE-----\ntest CA\n-----END CERTIFICATE-----\n";

describe("Hotelbeds runtime TLS file adapter", () => {
  let projectRoot = "";
  let certificatePath: string;
  let privateKeyPath: string;
  let caPath: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), "hotelbeds-tls-adapter-"));
    const tlsDirectory = join(projectRoot, "certs");
    mkdirSync(tlsDirectory);
    certificatePath = join(tlsDirectory, "client.pem");
    privateKeyPath = join(tlsDirectory, "client.key");
    caPath = join(tlsDirectory, "trusted-ca.pem");
    writeFileSync(certificatePath, TEST_CERTIFICATE);
    writeFileSync(privateKeyPath, TEST_PRIVATE_KEY);
    writeFileSync(caPath, TEST_CA);
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  function createEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    return {
      HOTELBEDS_ENV: HotelbedsEnvironment.TEST,
      HOTELBEDS_API_KEY: "test-api-key",
      HOTELBEDS_SECRET: "test-secret",
      HOTELBEDS_BASE_URL: "https://api.test.hotelbeds.com",
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: "certs/client.pem",
      HOTELBEDS_TLS_PRIVATE_KEY: "certs/client.key",
      ...overrides,
    };
  }

  function expectSafeReadFailure(environment: NodeJS.ProcessEnv, variableName: string, sensitiveValue: string): void {
    let error: unknown;
    try {
      loadHotelbedsFileIntegrationConfig(environment, projectRoot);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(HotelbedsConfigurationError);
    if (!(error instanceof Error)) {
      throw new Error("Expected an unreadable Hotelbeds TLS file configuration error.");
    }
    expect(error.message).toContain(variableName);
    expect(error.message).not.toContain(sensitiveValue);
  }

  it("loads relative certificate, private-key and optional CA paths from the project root", () => {
    const config = loadHotelbedsFileIntegrationConfig(
      createEnvironment({ HOTELBEDS_TLS_TRUSTED_CA: "certs/trusted-ca.pem" }),
      projectRoot,
    );

    expect(config.tls?.clientCertificate).toBe(readFileSync(certificatePath, "utf8").trim());
    expect(config.tls?.privateKey).toBe(TEST_PRIVATE_KEY.trim());
    expect(config.tls?.trustedCa).toBe(readFileSync(caPath, "utf8").trim());
  });

  it("supports absolute certificate and key paths and leaves the CA optional", () => {
    const config = loadHotelbedsFileIntegrationConfig(
      createEnvironment({
        HOTELBEDS_TLS_CLIENT_CERTIFICATE: certificatePath,
        HOTELBEDS_TLS_PRIVATE_KEY: privateKeyPath,
      }),
      projectRoot,
    );

    expect(config.tls?.clientCertificate).toBe(readFileSync(certificatePath, "utf8").trim());
    expect(config.tls?.privateKey).toBe(TEST_PRIVATE_KEY.trim());
    expect(config.tls?.trustedCa).toBe("");
  });

  it.each([
    ["HOTELBEDS_TLS_CLIENT_CERTIFICATE", "missing certificate value"],
    ["HOTELBEDS_TLS_PRIVATE_KEY", "missing private key value"],
  ])("reports missing %s files without exposing the path", (variableName, pathValue) => {
    const environment = createEnvironment({
      [variableName]: join(projectRoot, pathValue),
    });

    expectSafeReadFailure(environment, variableName, pathValue);
  });

  it.each([
    ["HOTELBEDS_TLS_CLIENT_CERTIFICATE", "certificate directory"],
    ["HOTELBEDS_TLS_PRIVATE_KEY", "private-key directory"],
  ])("reports unreadable %s files without exposing the path", (variableName, pathValue) => {
    const unreadablePath = join(projectRoot, pathValue);
    mkdirSync(unreadablePath);
    const environment = createEnvironment({ [variableName]: unreadablePath });

    expectSafeReadFailure(environment, variableName, unreadablePath);
  });

  it("preserves the private-key passphrase when loading encrypted key material", () => {
    writeFileSync(privateKeyPath, TEST_ENCRYPTED_PRIVATE_KEY);
    const environment = createEnvironment({
      HOTELBEDS_TLS_PRIVATE_KEY_PASSPHRASE: TEST_PASSPHRASE,
    });

    const config = loadHotelbedsFileIntegrationConfig(environment, projectRoot);

    expect(config.tls?.privateKey).toBe(TEST_ENCRYPTED_PRIVATE_KEY.trim());
    expect(config.tls?.privateKeyPassphrase).toBe(TEST_PASSPHRASE);
  });

  it("does not interpret file paths in the shared PEM-only loader", () => {
    expect(() => loadHotelbedsIntegrationConfig(createEnvironment({
      HOTELBEDS_TLS_CLIENT_CERTIFICATE: certificatePath,
      HOTELBEDS_TLS_PRIVATE_KEY: privateKeyPath,
    }))).toThrow(HotelbedsConfigurationError);
  });

  it("does not expose invalid key file contents in validation errors", () => {
    const privateKeyContents = "invalid private-key material";
    writeFileSync(privateKeyPath, privateKeyContents);
    const environment = createEnvironment();
    let error: unknown;
    try {
      loadHotelbedsFileIntegrationConfig(environment, projectRoot);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(HotelbedsConfigurationError);
    if (!(error instanceof Error)) {
      throw new Error("Expected invalid private-key configuration to be rejected.");
    }
    expect(error.message).not.toContain(privateKeyContents);
    expect(error.message).not.toContain(privateKeyPath);
  });
});
