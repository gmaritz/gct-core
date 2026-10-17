"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHotelbedsFileIntegrationConfig = loadHotelbedsFileIntegrationConfig;
exports.createHotelbedsRuntimeProvider = createHotelbedsRuntimeProvider;
const fs_1 = require("fs");
const path_1 = require("path");
const accommodation_1 = require("../../../application/accommodation");
const PROJECT_ROOT = (0, path_1.resolve)(__dirname, "../../../..");
const TLS_FILE_VARIABLES = [
    "HOTELBEDS_TLS_CLIENT_CERTIFICATE",
    "HOTELBEDS_TLS_PRIVATE_KEY",
    "HOTELBEDS_TLS_TRUSTED_CA",
];
function loadHotelbedsFileIntegrationConfig(environment = process.env, projectRoot = PROJECT_ROOT) {
    const effectiveEnvironment = { ...environment };
    TLS_FILE_VARIABLES.forEach((variableName) => {
        const configuredPath = environment[variableName]?.trim();
        if (!configuredPath) {
            return;
        }
        try {
            const filePath = (0, path_1.isAbsolute)(configuredPath)
                ? configuredPath
                : (0, path_1.resolve)(projectRoot, configuredPath);
            effectiveEnvironment[variableName] = (0, fs_1.readFileSync)(filePath, "utf8");
        }
        catch {
            throw new accommodation_1.HotelbedsConfigurationError(`Hotelbeds TLS file configured by ${variableName} could not be read.`);
        }
    });
    return (0, accommodation_1.loadHotelbedsIntegrationConfig)(effectiveEnvironment);
}
function createHotelbedsRuntimeProvider() {
    const configLoader = () => loadHotelbedsFileIntegrationConfig();
    const authentication = new accommodation_1.DefaultHotelbedsAuthentication(configLoader);
    const gateway = new accommodation_1.DefaultHotelbedsGateway(configLoader, authentication);
    const client = new accommodation_1.DefaultHotelbedsClient(gateway);
    const availabilityExecutor = new accommodation_1.DefaultHotelbedsAvailabilityExecutor(configLoader, authentication);
    return new accommodation_1.HotelbedsProvider(client, undefined, availabilityExecutor);
}
//# sourceMappingURL=hotelbeds-runtime.js.map