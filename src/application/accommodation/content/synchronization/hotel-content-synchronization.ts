import { HotelbedsGateway, HotelbedsIntegrationErrorCode, createHotelbedsIntegrationError } from "../../providers/hotelbeds/client";
import { HotelbedsContentMapper } from "../../providers/hotelbeds/mapper/hotel-content.mapper";
import { HotelbedsHotel } from "../../providers/hotelbeds/models";
import { createHotelContentRecord, HotelContentRecord } from "../models/hotel-content-record";
import { HotelCatalogueRepository } from "../../catalogue";

export type HotelContentSyncType = "FULL" | "INCREMENTAL";
export type HotelContentSyncExecutionStatus = "IDLE" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface HotelContentSyncState {
  readonly type: HotelContentSyncType;
  readonly executionStatus: HotelContentSyncExecutionStatus;
  readonly lastSuccessfulCheckpoint?: Date;
  readonly processedCount: number;
  readonly failedCount: number;
  readonly batchSize?: number;
  readonly totalSelectedHotels?: number;
  readonly batchesCompleted?: number;
  readonly hotelsProcessed?: number;
  readonly hotelsFailed?: number;
  readonly lastSuccessfulBatch?: number;
  readonly missingHotelCodes?: ReadonlyArray<string>;
  readonly failedBatches?: ReadonlyArray<number>;
  readonly retryCount?: number;
  readonly requestCount?: number;
  readonly elapsedTimeMs?: number;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly metadata: {
    readonly pagesProcessed: number;
    readonly lastErrorCode?: string;
    readonly lastErrorMessage?: string;
  };
}

export interface HotelContentSyncResult {
  readonly success: boolean;
  readonly type: HotelContentSyncType;
  readonly processedCount: number;
  readonly failedCount: number;
  readonly pagesProcessed: number;
  readonly checkpoint?: Date;
  readonly retryable: boolean;
  readonly errors: ReadonlyArray<{
    readonly code: string;
    readonly message: string;
    readonly retryable: boolean;
  }>;
  readonly selectedHotelCount: number;
  readonly batchCount: number;
  readonly requestCount: number;
  readonly successfulContentRecords: number;
  readonly missingHotelCodes: ReadonlyArray<string>;
  readonly failedBatches: ReadonlyArray<number>;
  readonly retryCount: number;
  readonly elapsedTimeMs: number;
  readonly finalState: HotelContentSyncExecutionStatus;
}

export interface HotelContentRepository {
  upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void>;
  findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null>;
  all(): Promise<ReadonlyArray<HotelContentRecord>>;
}

export interface HotelContentSyncStateRepository {
  getState(): Promise<HotelContentSyncState | null>;
  saveState(state: HotelContentSyncState): Promise<void>;
}

export interface HotelbedsContentSyncOptions {
  readonly pageSize?: number;
  readonly language?: string;
  readonly checkpoint?: Date;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly selectedHotelCodes?: ReadonlyArray<string>;
  readonly batchSize?: number;
  readonly maxQps?: number;
  readonly maxRetries?: number;
  readonly retryBaseDelayMs?: number;
}

export interface HotelbedsContentSyncSettings {
  readonly batchSize: number;
  readonly maxQps: number;
  readonly maxRetries: number;
  readonly retryBaseDelayMs: number;
  readonly sleep?: (delayMs: number) => Promise<void>;
}

interface HotelbedsContentHotelsPayload {
  readonly hotels?: ReadonlyArray<HotelbedsHotel>;
  readonly from?: number;
  readonly to?: number;
  readonly total?: number;
  readonly totalHotels?: number;
}

function defaultState(type: HotelContentSyncType): HotelContentSyncState {
  return {
    type,
    executionStatus: "IDLE",
    processedCount: 0,
    failedCount: 0,
    missingHotelCodes: [],
    failedBatches: [],
    retryCount: 0,
    requestCount: 0,
    metadata: {
      pagesProcessed: 0,
    },
  };
}

function createState(state: HotelContentSyncState): HotelContentSyncState {
  return Object.freeze({
    type: state.type,
    executionStatus: state.executionStatus,
    lastSuccessfulCheckpoint: state.lastSuccessfulCheckpoint
      ? new Date(state.lastSuccessfulCheckpoint.getTime())
      : undefined,
    processedCount: state.processedCount,
    failedCount: state.failedCount,
    batchSize: state.batchSize,
    totalSelectedHotels: state.totalSelectedHotels,
    batchesCompleted: state.batchesCompleted,
    hotelsProcessed: state.hotelsProcessed,
    hotelsFailed: state.hotelsFailed,
    lastSuccessfulBatch: state.lastSuccessfulBatch,
    missingHotelCodes: Object.freeze([...(state.missingHotelCodes ?? [])]),
    failedBatches: Object.freeze([...(state.failedBatches ?? [])]),
    retryCount: state.retryCount,
    requestCount: state.requestCount,
    elapsedTimeMs: state.elapsedTimeMs,
    startedAt: state.startedAt ? new Date(state.startedAt.getTime()) : undefined,
    completedAt: state.completedAt ? new Date(state.completedAt.getTime()) : undefined,
    metadata: Object.freeze({
      pagesProcessed: state.metadata.pagesProcessed,
      lastErrorCode: state.metadata.lastErrorCode,
      lastErrorMessage: state.metadata.lastErrorMessage,
    }),
  });
}

function createResult(result: HotelContentSyncResult): HotelContentSyncResult {
  return Object.freeze({
    success: result.success,
    type: result.type,
    processedCount: result.processedCount,
    failedCount: result.failedCount,
    pagesProcessed: result.pagesProcessed,
    checkpoint: result.checkpoint ? new Date(result.checkpoint.getTime()) : undefined,
    retryable: result.retryable,
    errors: Object.freeze(
      (result.errors ?? []).map((error) =>
        Object.freeze({
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        }),
      ),
    ),
    selectedHotelCount: result.selectedHotelCount,
    batchCount: result.batchCount,
    requestCount: result.requestCount,
    successfulContentRecords: result.successfulContentRecords,
    missingHotelCodes: Object.freeze([...(result.missingHotelCodes ?? [])]),
    failedBatches: Object.freeze([...(result.failedBatches ?? [])]),
    retryCount: result.retryCount,
    elapsedTimeMs: result.elapsedTimeMs,
    finalState: result.finalState,
  });
}

function parsePayload(body: unknown): HotelbedsContentHotelsPayload {
  if (!body || typeof body !== "object") {
    throw createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
      message: "Hotelbeds content payload is not an object.",
      retryable: false,
    });
  }

  const candidate = body as {
    readonly hotels?: ReadonlyArray<HotelbedsHotel> | HotelbedsContentHotelsPayload;
    readonly from?: number;
    readonly to?: number;
    readonly total?: number;
    readonly totalHotels?: number;
  };

  if (Array.isArray(candidate.hotels)) {
    return {
      hotels: candidate.hotels,
      from: candidate.from,
      to: candidate.to,
      total: candidate.total,
      totalHotels: candidate.totalHotels,
    };
  }

  if (candidate.hotels && typeof candidate.hotels === "object") {
    const nested = candidate.hotels as HotelbedsContentHotelsPayload;
    if (!Array.isArray(nested.hotels)) {
      throw createHotelbedsIntegrationError({
        code: HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
        message: "Hotelbeds content payload does not include hotels array.",
        retryable: false,
      });
    }

    return nested;
  }

  throw createHotelbedsIntegrationError({
    code: HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
    message: "Hotelbeds content payload does not include hotels array.",
    retryable: false,
  });
}

function normalizeSelectedHotelCodes(codes: ReadonlyArray<string> | undefined): ReadonlyArray<string> {
  return Object.freeze([...new Set((codes ?? []).map((code) => code.trim()).filter((code) => code.length > 0))]);
}

export class InMemoryHotelContentRepository implements HotelContentRepository {
  private readonly records = new Map<string, HotelContentRecord>();

  public async upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void> {
    records.forEach((record) => {
      this.records.set(record.providerHotelCode, createHotelContentRecord(record));
    });
  }

  public async findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null> {
    const record = this.records.get(providerHotelCode);
    return record ? createHotelContentRecord(record) : null;
  }

  public async all(): Promise<ReadonlyArray<HotelContentRecord>> {
    return Object.freeze([...this.records.values()].map((record) => createHotelContentRecord(record)));
  }
}

export class InMemoryHotelContentSyncStateRepository implements HotelContentSyncStateRepository {
  private state: HotelContentSyncState | null = null;

  public async getState(): Promise<HotelContentSyncState | null> {
    return this.state ? createState(this.state) : null;
  }

  public async saveState(state: HotelContentSyncState): Promise<void> {
    this.state = createState(state);
  }
}

export class HotelbedsContentSynchronizationService {
  public constructor(
    private readonly gateway: HotelbedsGateway,
    private readonly contentRepository: HotelContentRepository,
    private readonly stateRepository: HotelContentSyncStateRepository,
    private readonly mapper: HotelbedsContentMapper = new HotelbedsContentMapper(),
    private readonly selectedHotelCodes: ReadonlyArray<string> = [],
    private readonly catalogueRepository?: HotelCatalogueRepository,
    private readonly settings: HotelbedsContentSyncSettings = {
      batchSize: 50,
      maxQps: 1,
      maxRetries: 3,
      retryBaseDelayMs: 1000,
    },
  ) {}

  public async synchronizeFull(options: HotelbedsContentSyncOptions = {}): Promise<HotelContentSyncResult> {
    return this.synchronize("FULL", options);
  }

  public async synchronizeIncremental(
    options: HotelbedsContentSyncOptions = {},
  ): Promise<HotelContentSyncResult> {
    return this.synchronize("INCREMENTAL", options);
  }

  private async synchronize(
    type: HotelContentSyncType,
    options: HotelbedsContentSyncOptions,
  ): Promise<HotelContentSyncResult> {
    const catalogueCodes = this.catalogueRepository
      ? await this.catalogueRepository.findActive()
      : [];
    const configuredCodes = options.selectedHotelCodes ?? this.selectedHotelCodes;
    const selectedHotelCodes = normalizeSelectedHotelCodes(
      this.catalogueRepository ? catalogueCodes.map((entry) => entry.hotelCode) : configuredCodes,
    );
    if (selectedHotelCodes.length === 0) {
      return createResult({
        success: false,
        type,
        processedCount: 0,
        failedCount: 1,
        pagesProcessed: 0,
        retryable: false,
        errors: [
          {
            code: HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
            message: "No selected Hotelbeds hotel codes were configured.",
            retryable: false,
          },
        ],
        selectedHotelCount: 0,
        batchCount: 0,
        requestCount: 0,
        successfulContentRecords: 0,
        missingHotelCodes: [],
        failedBatches: [],
        retryCount: 0,
        elapsedTimeMs: 0,
        finalState: "FAILED",
      });
    }

    const existingState = (await this.stateRepository.getState()) ?? defaultState(type);
    if (existingState.executionStatus === "RUNNING") {
      return createResult({
        success: false,
        type,
        processedCount: 0,
        failedCount: 1,
        pagesProcessed: 0,
        retryable: true,
        errors: [
          {
            code: HotelbedsIntegrationErrorCode.PROVIDER_ERROR,
            message: "A content synchronization is already running.",
            retryable: true,
          },
        ],
        selectedHotelCount: 0,
        batchCount: 0,
        requestCount: 0,
        successfulContentRecords: 0,
        missingHotelCodes: [],
        failedBatches: [],
        retryCount: 0,
        elapsedTimeMs: 0,
        finalState: "FAILED",
      });
    }

    const now = new Date();
    const batchSize = options.batchSize ?? this.settings.batchSize;
    const maxQps = options.maxQps ?? this.settings.maxQps;
    const maxRetries = options.maxRetries ?? this.settings.maxRetries;
    const retryBaseDelayMs = options.retryBaseDelayMs ?? this.settings.retryBaseDelayMs;
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
      throw new Error("Hotelbeds content batch size must be a positive integer.");
    }
    if (!Number.isInteger(maxQps) || maxQps <= 0) {
      throw new Error("Hotelbeds content max QPS must be a positive integer.");
    }
    if (!Number.isInteger(maxRetries) || maxRetries < 0) {
      throw new Error("Hotelbeds content max retries must be a non-negative integer.");
    }
    if (!Number.isInteger(retryBaseDelayMs) || retryBaseDelayMs <= 0) {
      throw new Error("Hotelbeds content retry base delay must be a positive integer.");
    }
    const batches = Array.from({ length: Math.ceil(selectedHotelCodes.length / batchSize) }, (_, index) =>
      selectedHotelCodes.slice(index * batchSize, (index + 1) * batchSize),
    );
    const canResume = existingState.executionStatus === "FAILED" && existingState.type === type &&
      existingState.batchSize === batchSize && existingState.totalSelectedHotels === selectedHotelCodes.length;
    const firstBatch = canResume ? existingState.lastSuccessfulBatch ?? 0 : 0;
    let processedCount = canResume ? existingState.processedCount : 0;
    let pagesProcessed = canResume ? existingState.metadata.pagesProcessed : 0;
    let retryCount = canResume ? existingState.retryCount ?? 0 : 0;
    let requestCount = canResume ? existingState.requestCount ?? 0 : 0;
    let lastSuccessfulBatch = firstBatch;
    const missingHotelCodes = new Set(canResume ? existingState.missingHotelCodes ?? [] : []);
    const failedBatches = new Set(canResume ? existingState.failedBatches ?? [] : []);
    let lastRequestAt = 0;
    const sleep = this.settings.sleep ?? ((delayMs: number): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, delayMs)));
    const minRequestIntervalMs = 1000 / maxQps;
    const runningState: HotelContentSyncState = createState({
      ...existingState,
      type,
      executionStatus: "RUNNING",
      startedAt: now,
      completedAt: undefined,
      processedCount,
      failedCount: 0,
      batchSize,
      totalSelectedHotels: selectedHotelCodes.length,
      batchesCompleted: firstBatch,
      hotelsProcessed: processedCount,
      hotelsFailed: failedBatches.size,
      lastSuccessfulBatch: firstBatch || undefined,
      missingHotelCodes: [...missingHotelCodes],
      failedBatches: [...failedBatches],
      retryCount,
      requestCount,
      metadata: {
        pagesProcessed,
      },
    });
    await this.stateRepository.saveState(runningState);

    const checkpoint =
      options.checkpoint ?? (type === "INCREMENTAL" ? existingState.lastSuccessfulCheckpoint : undefined);

    try {
      for (let batchIndex = firstBatch; batchIndex < batches.length; batchIndex += 1) {
      const batchCodes = batches[batchIndex] ?? [];
      let response: Awaited<ReturnType<HotelbedsGateway["execute"]>> | undefined;
      let lastBatchError: { readonly code: string; readonly message: string; readonly retryable: boolean } | undefined;
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const elapsedSinceRequest = Date.now() - lastRequestAt;
        if (lastRequestAt > 0 && elapsedSinceRequest < minRequestIntervalMs) {
          await sleep(Math.ceil(minRequestIntervalMs - elapsedSinceRequest));
        }
        lastRequestAt = Date.now();
        requestCount += 1;
        response = await this.gateway.execute<HotelbedsContentHotelsPayload>({
          operation: "content-sync",
          method: "GET",
          path: "/hotel-content-api/1.0/hotels",
          requestId: options.requestId,
          correlationId: options.correlationId,
          query: {
            fields: "all",
            codes: batchCodes.join(","),
            ...(checkpoint ? { lastUpdateTime: checkpoint.toISOString() } : {}),
            ...(options.language ? { language: options.language } : {}),
          },
        });
        if (response.success && response.data !== null) break;
        const firstError = response.errors[0] ?? {
          code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
          message: "Unknown content synchronization error.",
          retryable: false,
        };
        lastBatchError = firstError;
        if (!firstError.retryable || attempt === maxRetries) break;
        retryCount += 1;
        await sleep(retryBaseDelayMs * 2 ** attempt);
      }

      if (!response || !response.success || response.data === null) {
        failedBatches.add(batchIndex + 1);
        throw lastBatchError ?? createHotelbedsIntegrationError({
          code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
          message: "Unknown content synchronization error.",
          retryable: false,
        });
      }

      const payload = parsePayload(response.data);
      const selectedHotelCodeSet = new Set(batchCodes);
      const hotels = (payload.hotels ?? []).filter((hotel) => {
        const code = typeof hotel.code === "string" || typeof hotel.code === "number" ? String(hotel.code).trim() : "";
        return selectedHotelCodeSet.has(code);
      });

      const returnedCodes = new Set(hotels.map((hotel) => String(hotel.code).trim()));
      batchCodes.forEach((code) => {
        if (returnedCodes.has(code)) missingHotelCodes.delete(code);
        else missingHotelCodes.add(code);
      });

      const mappedRecords = hotels.map((hotel) => this.mapper.mapHotel(hotel, now));
      await this.contentRepository.upsertMany(mappedRecords);

      processedCount += mappedRecords.length;
      pagesProcessed += 1;
      failedBatches.delete(batchIndex + 1);
      await this.stateRepository.saveState(createState({
        ...runningState,
        processedCount,
        batchSize,
        totalSelectedHotels: selectedHotelCodes.length,
        batchesCompleted: batchIndex + 1,
        hotelsProcessed: processedCount,
        hotelsFailed: missingHotelCodes.size,
        lastSuccessfulBatch: batchIndex + 1,
        missingHotelCodes: [...missingHotelCodes],
        failedBatches: [...failedBatches],
        retryCount,
        requestCount,
        metadata: { pagesProcessed },
      }));
      lastSuccessfulBatch = batchIndex + 1;
      }

      const successfulState: HotelContentSyncState = createState({
        ...runningState,
        executionStatus: "SUCCEEDED",
        processedCount,
        failedCount: failedBatches.size,
        completedAt: new Date(),
        lastSuccessfulCheckpoint: now,
        batchesCompleted: batches.length,
        hotelsProcessed: processedCount,
        hotelsFailed: missingHotelCodes.size,
        lastSuccessfulBatch: batches.length,
        missingHotelCodes: [...missingHotelCodes],
        failedBatches: [...failedBatches],
        retryCount,
        requestCount,
        elapsedTimeMs: Date.now() - now.getTime(),
        metadata: {
          pagesProcessed,
        },
      });
      await this.stateRepository.saveState(successfulState);

      return createResult({
        success: true,
        type,
        processedCount,
        failedCount: 0,
        pagesProcessed,
        checkpoint: now,
        retryable: false,
        errors: [],
        selectedHotelCount: selectedHotelCodes.length,
        batchCount: batches.length,
        requestCount,
        successfulContentRecords: processedCount,
        missingHotelCodes: [...missingHotelCodes],
        failedBatches: [...failedBatches],
        retryCount,
        elapsedTimeMs: Date.now() - now.getTime(),
        finalState: "SUCCEEDED",
      });
    } catch (error) {
      const activeBatch = Math.min(lastSuccessfulBatch + 1, batches.length);
      failedBatches.add(activeBatch);
      const mappedError =
        error && typeof error === "object" && "code" in error && "message" in error
          ? {
              code: String((error as { readonly code?: string }).code ?? HotelbedsIntegrationErrorCode.UNKNOWN_ERROR),
              message: String((error as { readonly message?: string }).message ?? "Synchronization failed."),
              retryable: Boolean((error as { readonly retryable?: boolean }).retryable ?? false),
            }
          : {
              code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
              message: error instanceof Error ? error.message : "Synchronization failed.",
              retryable: false,
            };

      const failedState: HotelContentSyncState = createState({
        ...runningState,
        executionStatus: "FAILED",
        processedCount,
        failedCount: failedBatches.size || 1,
        completedAt: new Date(),
        batchesCompleted: lastSuccessfulBatch,
        hotelsProcessed: processedCount,
        hotelsFailed: missingHotelCodes.size,
        lastSuccessfulBatch: lastSuccessfulBatch || undefined,
        missingHotelCodes: [...missingHotelCodes],
        failedBatches: [...failedBatches],
        retryCount,
        requestCount,
        elapsedTimeMs: Date.now() - now.getTime(),
        metadata: {
          pagesProcessed,
          lastErrorCode: mappedError.code,
          lastErrorMessage: mappedError.message,
        },
      });
      await this.stateRepository.saveState(failedState);

      return createResult({
        success: false,
        type,
        processedCount,
        failedCount: failedBatches.size || 1,
        pagesProcessed,
        checkpoint: existingState.lastSuccessfulCheckpoint,
        retryable: mappedError.retryable,
        errors: [mappedError],
        selectedHotelCount: selectedHotelCodes.length,
        batchCount: batches.length,
        requestCount,
        successfulContentRecords: processedCount,
        missingHotelCodes: [...missingHotelCodes],
        failedBatches: [...failedBatches],
        retryCount,
        elapsedTimeMs: Date.now() - now.getTime(),
        finalState: "FAILED",
      });
    }
  }
}
