"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadR8DotEnv = loadR8DotEnv;
exports.resolveR8Path = resolveR8Path;
exports.createR8EffectiveEnvironment = createR8EffectiveEnvironment;
exports.parseLiveVerificationFlag = parseLiveVerificationFlag;
exports.parseLiveVerificationConfiguration = parseLiveVerificationConfiguration;
exports.createAvailabilityQuery = createAvailabilityQuery;
exports.createLiveAvailabilityService = createLiveAvailabilityService;
exports.runLiveVerification = runLiveVerification;
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const accommodation_1 = require("../../application/accommodation");
const PROJECT_ROOT = (0, path_1.resolve)(__dirname, "../../..");
const DOTENV_PATH = (0, path_1.join)(PROJECT_ROOT, ".env");
function loadR8DotEnv(environment = process.env) {
    const existingValues = new Map(Object.keys(environment).map((name) => [name, environment[name]]));
    const result = (0, dotenv_1.config)({
        path: DOTENV_PATH,
        processEnv: environment,
        override: false,
        quiet: true,
    });
    if (result.error && result.error.code !== "ENOENT") {
        throw new Error("R8 environment configuration could not be loaded.");
    }
    existingValues.forEach((value, name) => {
        if (value !== undefined) {
            environment[name] = value;
        }
    });
    return environment;
}
function resolveR8Path(value) {
    return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(PROJECT_ROOT, value);
}
function readR8TlsFile(environment, variableName) {
    const configuredPath = environment[variableName]?.trim();
    if (!configuredPath) {
        throw new Error(`Missing R8 TLS file configuration: ${variableName}.`);
    }
    try {
        const resolvedPath = resolveR8Path(configuredPath);
        (0, fs_1.accessSync)(resolvedPath, fs_1.constants.R_OK);
        return (0, fs_1.readFileSync)(resolvedPath, "utf8");
    }
    catch {
        throw new Error(`R8 TLS file configuration is unreadable: ${variableName}.`);
    }
}
function createR8EffectiveEnvironment(environment) {
    if (!environment.HOTELBEDS_API_KEY?.trim()) {
        throw new Error("Missing Hotelbeds API key configuration.");
    }
    if (!environment.HOTELBEDS_SECRET?.trim()) {
        throw new Error("Missing Hotelbeds secret configuration.");
    }
    if (!environment.HOTELBEDS_BASE_URL?.trim()) {
        throw new Error("Missing Hotelbeds base URL configuration.");
    }
    const effectiveEnvironment = { ...environment };
    effectiveEnvironment.HOTELBEDS_TLS_CLIENT_CERTIFICATE = readR8TlsFile(environment, "HOTELBEDS_TLS_CLIENT_CERTIFICATE");
    effectiveEnvironment.HOTELBEDS_TLS_PRIVATE_KEY = readR8TlsFile(environment, "HOTELBEDS_TLS_PRIVATE_KEY");
    if (environment.HOTELBEDS_TLS_TRUSTED_CA?.trim()) {
        effectiveEnvironment.HOTELBEDS_TLS_TRUSTED_CA = readR8TlsFile(environment, "HOTELBEDS_TLS_TRUSTED_CA");
    }
    else {
        delete effectiveEnvironment.HOTELBEDS_TLS_TRUSTED_CA;
    }
    return effectiveEnvironment;
}
function readRequired(environment, name) {
    const value = environment[name]?.trim();
    if (!value) {
        throw new Error(`Missing live verification configuration: ${name}.`);
    }
    return value;
}
function parsePositiveInteger(value, name) {
    if (!/^\d+$/.test(value)) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    return parsed;
}
function parseNonNegativeInteger(value, name) {
    if (!/^\d+$/.test(value)) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 0) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    return parsed;
}
function parseDate(value, name) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day) {
        throw new Error(`Invalid live verification configuration: ${name}.`);
    }
    return date;
}
function parseChildAges(environment, children) {
    const rawAges = environment.HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES?.trim() ?? "";
    if (children === 0) {
        if (rawAges) {
            throw new Error("Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES.");
        }
        return Object.freeze([]);
    }
    if (!rawAges) {
        throw new Error("Missing live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES.");
    }
    const ages = rawAges.split(",").map((age, index) => parseNonNegativeInteger(age.trim(), `HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES[${index}]`));
    if (ages.length !== children) {
        throw new Error("Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES.");
    }
    return Object.freeze(ages);
}
function parseHotelCodes(environment) {
    const rawCodes = readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES");
    const seen = new Set();
    const hotelCodes = [];
    rawCodes.split(",").forEach((value, index) => {
        const hotelCode = value.trim();
        if (!hotelCode) {
            throw new Error(`Invalid live verification configuration: empty hotel code at index ${index}.`);
        }
        if (!(0, accommodation_1.isValidExplicitHotelCode)(hotelCode)) {
            throw new Error(`Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES[${index}].`);
        }
        if (!seen.has(hotelCode)) {
            seen.add(hotelCode);
            hotelCodes.push(hotelCode);
        }
    });
    return Object.freeze(hotelCodes);
}
function parseLiveVerificationFlag(value) {
    const normalized = value?.trim().toLowerCase() ?? "";
    if (!normalized || normalized === "false" || normalized === "0") {
        return false;
    }
    if (normalized === "true" || normalized === "1") {
        return true;
    }
    throw new Error("Invalid HOTELBEDS_AVAILABILITY_LIVE_VERIFY value.");
}
function parseLiveVerificationConfiguration(environment) {
    const checkInDate = parseDate(readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN"), "HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN");
    const checkOutDate = parseDate(readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT"), "HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT");
    if (checkOutDate.getTime() <= checkInDate.getTime()) {
        throw new Error("Invalid live verification configuration: check-out must be after check-in.");
    }
    const adults = parsePositiveInteger(readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_ADULTS"), "HOTELBEDS_AVAILABILITY_LIVE_ADULTS");
    const children = parseNonNegativeInteger(readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHILDREN"), "HOTELBEDS_AVAILABILITY_LIVE_CHILDREN");
    const sourceMarket = readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_SOURCE_MARKET");
    return Object.freeze({
        hotelCodes: parseHotelCodes(environment),
        checkInDate,
        checkOutDate,
        adults,
        children,
        childAges: parseChildAges(environment, children),
        sourceMarket,
    });
}
function createAvailabilityQuery(configuration) {
    const criteria = {
        destination: "Hotelbeds live verification",
        checkInDate: configuration.checkInDate,
        checkOutDate: configuration.checkOutDate,
        sourceMarket: configuration.sourceMarket,
        occupancies: [
            {
                rooms: 1,
                adults: configuration.adults,
                children: configuration.children,
                childAges: configuration.childAges,
            },
        ],
        adults: configuration.adults,
        children: configuration.children,
        rooms: 1,
        hotelCodes: configuration.hotelCodes,
    };
    const context = {
        requestId: "app-008.3-r8-live-verification",
        source: accommodation_1.AccommodationSearchSource.INTERNAL,
        channel: "hotelbeds-live-verification",
        locale: "en-ZA",
        currency: "ZAR",
        timestamp: new Date(),
    };
    return { criteria, context };
}
function createLiveAvailabilityService(hotelCodes, observation = { resolvedCandidateCount: 0, supplierRequestCount: 0 }, effectiveEnvironment = process.env, transport) {
    const catalogueRepository = new accommodation_1.InMemoryHotelCatalogueRepository();
    hotelCodes.forEach((hotelCode) => {
        void catalogueRepository.upsert((0, accommodation_1.createHotelCatalogueEntry)({
            hotelCode,
            starGrading: 4,
            destinationCode: "R8",
            zoneCode: "R8",
            zoneName: "R8 Live Verification",
            active: true,
        }));
    });
    const observedRepository = {
        findActive: async (filter) => {
            const entries = await catalogueRepository.findActive(filter);
            observation.resolvedCandidateCount = entries.length;
            return entries;
        },
        upsert: (entry) => catalogueRepository.upsert(entry),
        deactivateMissing: (codes) => catalogueRepository.deactivateMissing(codes),
    };
    const catalogueService = new accommodation_1.HotelCatalogueService(observedRepository);
    const providerRegistry = new accommodation_1.InMemoryProviderRegistry();
    const loadEffectiveConfiguration = () => (0, accommodation_1.loadHotelbedsIntegrationConfig)(effectiveEnvironment);
    const availabilityExecutor = new accommodation_1.DefaultHotelbedsAvailabilityExecutor(loadEffectiveConfiguration, new accommodation_1.DefaultHotelbedsAuthentication(loadEffectiveConfiguration), transport);
    providerRegistry.register(new accommodation_1.HotelbedsProvider(undefined, undefined, availabilityExecutor));
    return new accommodation_1.DefaultAccommodationAvailabilityService(providerRegistry, catalogueService, new ObservedAvailabilityRequestBuilder(observation));
}
class ObservedAvailabilityRequestBuilder extends accommodation_1.HotelbedsAvailabilityRequestBuilder {
    constructor(observation) {
        super();
        this.observation = observation;
    }
    build(criteria, candidates) {
        const requests = super.build(criteria, candidates);
        this.observation.supplierRequestCount = requests.length;
        return requests;
    }
}
async function runLiveVerification(environment = process.env, dependencies = {}) {
    const enabled = parseLiveVerificationFlag(environment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY);
    if (!enabled) {
        return Object.freeze({ status: "DISABLED" });
    }
    const configuration = parseLiveVerificationConfiguration(environment);
    (dependencies.validateSupplierConfiguration ?? accommodation_1.loadHotelbedsIntegrationConfig)(environment);
    const observation = {
        resolvedCandidateCount: 0,
        supplierRequestCount: 0,
    };
    const service = dependencies.createService?.(configuration.hotelCodes, observation) ?? createLiveAvailabilityService(configuration.hotelCodes, observation, environment);
    const result = await service.execute(createAvailabilityQuery(configuration));
    const report = {
        executionTimestamp: new Date(),
        configuredHotelCount: configuration.hotelCodes.length,
        resolvedCandidateCount: observation.resolvedCandidateCount,
        supplierRequestCount: observation.supplierRequestCount,
        supplierExecutionStatus: "COMPLETED",
        provider: result.metadata.provider ?? "unknown",
        available: result.available,
        success: true,
    };
    return Object.freeze({ status: "COMPLETED", result, report });
}
async function main() {
    const environment = loadR8DotEnv();
    if (!parseLiveVerificationFlag(environment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY)) {
        process.stdout.write("Hotelbeds live availability verification is disabled.\n");
        return;
    }
    const effectiveEnvironment = createR8EffectiveEnvironment(environment);
    const outcome = await runLiveVerification(effectiveEnvironment);
    process.stdout.write(`${JSON.stringify({
        status: outcome.status,
        ...outcome.report,
    }, null, 2)}\n`);
}
if (require.main === module) {
    void main().catch((error) => {
        console.error(error instanceof Error ? error.message : "Hotelbeds live verification failed.");
        process.exitCode = 1;
    });
}
//# sourceMappingURL=availability-live-verification.js.map