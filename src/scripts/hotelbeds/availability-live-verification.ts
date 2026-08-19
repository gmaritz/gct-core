import {
  AccommodationAvailabilityResult,
  AccommodationAvailabilityService,
  AccommodationSearchContext,
  AccommodationSearchCriteria,
  AccommodationSearchQuery,
  AccommodationSearchSource,
  DefaultAccommodationAvailabilityService,
  HotelbedsAvailabilityRequestBuilder,
  HotelbedsProvider,
  HotelCatalogueEntry,
  HotelCatalogueFilter,
  HotelCatalogueRepository,
  InMemoryHotelCatalogueRepository,
  InMemoryProviderRegistry,
  HotelCatalogueService,
  createHotelCatalogueEntry,
  isValidExplicitHotelCode,
  loadHotelbedsIntegrationConfig,
} from "../../application/accommodation";
import { HotelbedsAvailabilityRequest } from "../../application/accommodation/providers/hotelbeds/client";

export type LiveVerificationStatus = "DISABLED" | "COMPLETED";

export interface LiveVerificationOutcome {
  readonly status: LiveVerificationStatus;
  readonly result?: AccommodationAvailabilityResult;
  readonly report?: LiveVerificationReport;
}

export interface LiveVerificationConfiguration {
  readonly hotelCodes: ReadonlyArray<string>;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly adults: number;
  readonly children: number;
  readonly childAges: ReadonlyArray<number>;
  readonly sourceMarket: string;
}

export interface LiveVerificationReport {
  readonly executionTimestamp: Date;
  readonly configuredHotelCount: number;
  readonly resolvedCandidateCount: number;
  readonly supplierRequestCount: number;
  readonly supplierExecutionStatus: "COMPLETED";
  readonly provider: string;
  readonly available: boolean;
  readonly success: boolean;
}

export interface LiveVerificationObservation {
  resolvedCandidateCount: number;
  supplierRequestCount: number;
}

export interface LiveVerificationDependencies {
  readonly createService?: (
    hotelCodes: ReadonlyArray<string>,
    observation: LiveVerificationObservation,
  ) => AccommodationAvailabilityService;
  readonly validateSupplierConfiguration?: (environment: NodeJS.ProcessEnv) => void;
}

function readRequired(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`Missing live verification configuration: ${name}.`);
  }

  return value;
}

function parsePositiveInteger(value: string, name: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  return parsed;
}

function parseNonNegativeInteger(value: string, name: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  return parsed;
}

function parseDate(value: string, name: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid live verification configuration: ${name}.`);
  }

  return date;
}

function parseChildAges(
  environment: NodeJS.ProcessEnv,
  children: number,
): ReadonlyArray<number> {
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

  const ages = rawAges.split(",").map((age, index) =>
    parseNonNegativeInteger(age.trim(), `HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES[${index}]`),
  );

  if (ages.length !== children) {
    throw new Error("Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_CHILD_AGES.");
  }

  return Object.freeze(ages);
}

function parseHotelCodes(environment: NodeJS.ProcessEnv): ReadonlyArray<string> {
  const rawCodes = readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES");
  const seen = new Set<string>();
  const hotelCodes: string[] = [];

  rawCodes.split(",").forEach((value, index) => {
    const hotelCode = value.trim();
    if (!hotelCode) {
      throw new Error(`Invalid live verification configuration: empty hotel code at index ${index}.`);
    }

    if (!isValidExplicitHotelCode(hotelCode)) {
      throw new Error(`Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODES[${index}].`);
    }

    if (!seen.has(hotelCode)) {
      seen.add(hotelCode);
      hotelCodes.push(hotelCode);
    }
  });

  return Object.freeze(hotelCodes);
}

export function parseLiveVerificationFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!normalized || normalized === "false" || normalized === "0") {
    return false;
  }

  if (normalized === "true" || normalized === "1") {
    return true;
  }

  throw new Error("Invalid HOTELBEDS_AVAILABILITY_LIVE_VERIFY value.");
}

export function parseLiveVerificationConfiguration(
  environment: NodeJS.ProcessEnv,
): LiveVerificationConfiguration {
  const checkInDate = parseDate(
    readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN"),
    "HOTELBEDS_AVAILABILITY_LIVE_CHECK_IN",
  );
  const checkOutDate = parseDate(
    readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT"),
    "HOTELBEDS_AVAILABILITY_LIVE_CHECK_OUT",
  );
  if (checkOutDate.getTime() <= checkInDate.getTime()) {
    throw new Error("Invalid live verification configuration: check-out must be after check-in.");
  }

  const adults = parsePositiveInteger(
    readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_ADULTS"),
    "HOTELBEDS_AVAILABILITY_LIVE_ADULTS",
  );
  const children = parseNonNegativeInteger(
    readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_CHILDREN"),
    "HOTELBEDS_AVAILABILITY_LIVE_CHILDREN",
  );
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

export function createAvailabilityQuery(configuration: LiveVerificationConfiguration): AccommodationSearchQuery {
  const criteria: AccommodationSearchCriteria = {
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

  const context: AccommodationSearchContext = {
    requestId: "app-008.3-r8-live-verification",
    source: AccommodationSearchSource.INTERNAL,
    channel: "hotelbeds-live-verification",
    locale: "en-ZA",
    currency: "ZAR",
    timestamp: new Date(),
  };

  return { criteria, context };
}

export function createLiveAvailabilityService(
  hotelCodes: ReadonlyArray<string>,
  observation: LiveVerificationObservation = { resolvedCandidateCount: 0, supplierRequestCount: 0 },
): AccommodationAvailabilityService {
  const catalogueRepository = new InMemoryHotelCatalogueRepository();
  hotelCodes.forEach((hotelCode) => {
    void catalogueRepository.upsert(
      createHotelCatalogueEntry({
        hotelCode,
        starGrading: 4,
        destinationCode: "R8",
        zoneCode: "R8",
        zoneName: "R8 Live Verification",
        active: true,
      }),
    );
  });

  const observedRepository: HotelCatalogueRepository = {
    findActive: async (filter?: HotelCatalogueFilter): Promise<ReadonlyArray<HotelCatalogueEntry>> => {
      const entries = await catalogueRepository.findActive(filter);
      observation.resolvedCandidateCount = entries.length;
      return entries;
    },
    upsert: (entry) => catalogueRepository.upsert(entry),
    deactivateMissing: (codes) => catalogueRepository.deactivateMissing(codes),
  };

  const catalogueService = new HotelCatalogueService(observedRepository);
  const providerRegistry = new InMemoryProviderRegistry();
  providerRegistry.register(new HotelbedsProvider());

  return new DefaultAccommodationAvailabilityService(
    providerRegistry,
    catalogueService,
    new ObservedAvailabilityRequestBuilder(observation),
  );
}

class ObservedAvailabilityRequestBuilder extends HotelbedsAvailabilityRequestBuilder {
  public constructor(private readonly observation: LiveVerificationObservation) {
    super();
  }

  public override build(
    criteria: AccommodationSearchCriteria,
    candidates: ReadonlyArray<{ readonly hotelCode: string }>,
  ): ReadonlyArray<HotelbedsAvailabilityRequest> {
    const requests = super.build(criteria, candidates);
    this.observation.supplierRequestCount = requests.length;
    return requests;
  }
}

export async function runLiveVerification(
  environment: NodeJS.ProcessEnv = process.env,
  dependencies: LiveVerificationDependencies = {},
): Promise<LiveVerificationOutcome> {
  const enabled = parseLiveVerificationFlag(environment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY);
  if (!enabled) {
    return Object.freeze({ status: "DISABLED" });
  }

  const configuration = parseLiveVerificationConfiguration(environment);
  (dependencies.validateSupplierConfiguration ?? loadHotelbedsIntegrationConfig)(environment);
  const observation: LiveVerificationObservation = {
    resolvedCandidateCount: 0,
    supplierRequestCount: 0,
  };
  const service = dependencies.createService?.(configuration.hotelCodes, observation) ?? createLiveAvailabilityService(configuration.hotelCodes, observation);
  const result = await service.execute(createAvailabilityQuery(configuration));
  const report: LiveVerificationReport = {
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

async function main(): Promise<void> {
  const outcome = await runLiveVerification();
  if (outcome.status === "DISABLED") {
    console.log("Hotelbeds live availability verification is disabled.");
    return;
  }

  console.log(JSON.stringify({
    status: outcome.status,
    ...outcome.report,
  }, null, 2));
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Hotelbeds live verification failed.");
    process.exitCode = 1;
  });
}