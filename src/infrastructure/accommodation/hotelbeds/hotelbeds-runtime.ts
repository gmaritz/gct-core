import { readFileSync } from "fs";
import { isAbsolute, resolve } from "path";

import {
  DefaultHotelbedsAuthentication,
  DefaultHotelbedsAvailabilityExecutor,
  DefaultHotelbedsClient,
  DefaultHotelbedsGateway,
  HotelbedsConfigurationError,
  HotelbedsIntegrationConfig,
  HotelbedsProvider,
  loadHotelbedsIntegrationConfig,
} from "../../../application/accommodation";

const PROJECT_ROOT = resolve(__dirname, "../../../..");
const TLS_FILE_VARIABLES = [
  "HOTELBEDS_TLS_CLIENT_CERTIFICATE",
  "HOTELBEDS_TLS_PRIVATE_KEY",
  "HOTELBEDS_TLS_TRUSTED_CA",
] as const;

export function loadHotelbedsFileIntegrationConfig(
  environment: NodeJS.ProcessEnv = process.env,
  projectRoot: string = PROJECT_ROOT,
): HotelbedsIntegrationConfig {
  const effectiveEnvironment: NodeJS.ProcessEnv = { ...environment };

  TLS_FILE_VARIABLES.forEach((variableName) => {
    const configuredPath = environment[variableName]?.trim();
    if (!configuredPath) {
      return;
    }

    try {
      const filePath = isAbsolute(configuredPath)
        ? configuredPath
        : resolve(projectRoot, configuredPath);
      effectiveEnvironment[variableName] = readFileSync(filePath, "utf8");
    } catch {
      throw new HotelbedsConfigurationError(
        `Hotelbeds TLS file configured by ${variableName} could not be read.`,
      );
    }
  });

  return loadHotelbedsIntegrationConfig(effectiveEnvironment);
}

export function createHotelbedsRuntimeProvider(): HotelbedsProvider {
  const configLoader = (): HotelbedsIntegrationConfig => loadHotelbedsFileIntegrationConfig();
  const authentication = new DefaultHotelbedsAuthentication(configLoader);
  const gateway = new DefaultHotelbedsGateway(configLoader, authentication);
  const client = new DefaultHotelbedsClient(gateway);
  const availabilityExecutor = new DefaultHotelbedsAvailabilityExecutor(
    configLoader,
    authentication,
  );

  return new HotelbedsProvider(client, undefined, availabilityExecutor);
}
