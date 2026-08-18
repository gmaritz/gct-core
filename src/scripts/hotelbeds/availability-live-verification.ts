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
  InMemoryHotelCatalogueRepository,
  InMemoryProviderRegistry,
  HotelCatalogueService,
  createHotelCatalogueEntry,
  isValidExplicitHotelCode,
  loadHotelbedsIntegrationConfig,
} from "../../application/accommodation";

export type LiveVerificationStatus = "DISABLED" | "COMPLETED";

export interface LiveVerificationOutcome {
  readonly status: LiveVerificationStatus;
  readonly result?: AccommodationAvailabilityResult;
}

export interface LiveVerificationConfiguration {
  readonly hotelCode: string;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly adults: number;
  readonly children: number;
  readonly childAges: ReadonlyArray<number>;
  readonly sourceMarket: string;
}

export interface LiveVerificationDependencies {
  readonly createService?: () => AccommodationAvailabilityService;
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
  const hotelCode = readRequired(environment, "HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE");
  if (!isValidExplicitHotelCode(hotelCode)) {
    throw new Error("Invalid live verification configuration: HOTELBEDS_AVAILABILITY_LIVE_HOTEL_CODE.");
  }

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
    hotelCode: hotelCode.trim(),
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
    hotelCodes: [configuration.hotelCode],
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
  hotelCode: string,
): AccommodationAvailabilityService {
  const catalogueRepository = new InMemoryHotelCatalogueRepository();
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

  const catalogueService = new HotelCatalogueService(catalogueRepository);
  const providerRegistry = new InMemoryProviderRegistry();
  providerRegistry.register(new HotelbedsProvider());

  return new DefaultAccommodationAvailabilityService(
    providerRegistry,
    catalogueService,
    new HotelbedsAvailabilityRequestBuilder(),
  );
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
  const service = dependencies.createService?.() ?? createLiveAvailabilityService(configuration.hotelCode);
  const result = await service.execute(createAvailabilityQuery(configuration));

  return Object.freeze({ status: "COMPLETED", result });
}

async function main(): Promise<void> {
  const outcome = await runLiveVerification();
  if (outcome.status === "DISABLED") {
    console.log("Hotelbeds live availability verification is disabled.");
    return;
  }

  console.log(JSON.stringify({
    status: outcome.status,
    available: outcome.result?.available,
    provider: outcome.result?.metadata.provider,
    generatedAt: outcome.result?.metadata.generatedAt,
  }, null, 2));
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Hotelbeds live verification failed.");
    process.exitCode = 1;
  });
}