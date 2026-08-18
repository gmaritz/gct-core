"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsContentSynchronizationService = exports.InMemoryHotelContentSyncStateRepository = exports.InMemoryHotelContentRepository = void 0;
const client_1 = require("../../providers/hotelbeds/client");
const hotel_content_mapper_1 = require("../../providers/hotelbeds/mapper/hotel-content.mapper");
const hotel_content_record_1 = require("../models/hotel-content-record");
function defaultState(type) {
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
function createState(state) {
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
function createResult(result) {
    return Object.freeze({
        success: result.success,
        type: result.type,
        processedCount: result.processedCount,
        failedCount: result.failedCount,
        pagesProcessed: result.pagesProcessed,
        checkpoint: result.checkpoint ? new Date(result.checkpoint.getTime()) : undefined,
        retryable: result.retryable,
        errors: Object.freeze((result.errors ?? []).map((error) => Object.freeze({
            code: error.code,
            message: error.message,
            retryable: error.retryable,
        }))),
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
function parsePayload(body) {
    if (!body || typeof body !== "object") {
        throw (0, client_1.createHotelbedsIntegrationError)({
            code: client_1.HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
            message: "Hotelbeds content payload is not an object.",
            retryable: false,
        });
    }
    const candidate = body;
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
        const nested = candidate.hotels;
        if (!Array.isArray(nested.hotels)) {
            throw (0, client_1.createHotelbedsIntegrationError)({
                code: client_1.HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
                message: "Hotelbeds content payload does not include hotels array.",
                retryable: false,
            });
        }
        return nested;
    }
    throw (0, client_1.createHotelbedsIntegrationError)({
        code: client_1.HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
        message: "Hotelbeds content payload does not include hotels array.",
        retryable: false,
    });
}
function normalizeSelectedHotelCodes(codes) {
    return Object.freeze([...new Set((codes ?? []).map((code) => code.trim()).filter((code) => code.length > 0))]);
}
class InMemoryHotelContentRepository {
    constructor() {
        this.records = new Map();
    }
    async upsertMany(records) {
        records.forEach((record) => {
            this.records.set(record.providerHotelCode, (0, hotel_content_record_1.createHotelContentRecord)(record));
        });
    }
    async findByProviderHotelCode(providerHotelCode) {
        const record = this.records.get(providerHotelCode);
        return record ? (0, hotel_content_record_1.createHotelContentRecord)(record) : null;
    }
    async all() {
        return Object.freeze([...this.records.values()].map((record) => (0, hotel_content_record_1.createHotelContentRecord)(record)));
    }
}
exports.InMemoryHotelContentRepository = InMemoryHotelContentRepository;
class InMemoryHotelContentSyncStateRepository {
    constructor() {
        this.state = null;
    }
    async getState() {
        return this.state ? createState(this.state) : null;
    }
    async saveState(state) {
        this.state = createState(state);
    }
}
exports.InMemoryHotelContentSyncStateRepository = InMemoryHotelContentSyncStateRepository;
class HotelbedsContentSynchronizationService {
    constructor(gateway, contentRepository, stateRepository, mapper = new hotel_content_mapper_1.HotelbedsContentMapper(), selectedHotelCodes = [], catalogueRepository, settings = {
        batchSize: 50,
        maxQps: 1,
        maxRetries: 3,
        retryBaseDelayMs: 1000,
    }) {
        this.gateway = gateway;
        this.contentRepository = contentRepository;
        this.stateRepository = stateRepository;
        this.mapper = mapper;
        this.selectedHotelCodes = selectedHotelCodes;
        this.catalogueRepository = catalogueRepository;
        this.settings = settings;
    }
    async synchronizeFull(options = {}) {
        return this.synchronize("FULL", options);
    }
    async synchronizeIncremental(options = {}) {
        return this.synchronize("INCREMENTAL", options);
    }
    async synchronize(type, options) {
        const catalogueCodes = this.catalogueRepository
            ? await this.catalogueRepository.findActive()
            : [];
        const configuredCodes = options.selectedHotelCodes ?? this.selectedHotelCodes;
        const selectedHotelCodes = normalizeSelectedHotelCodes(this.catalogueRepository ? catalogueCodes.map((entry) => entry.hotelCode) : configuredCodes);
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
                        code: client_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
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
                        code: client_1.HotelbedsIntegrationErrorCode.PROVIDER_ERROR,
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
        const batches = Array.from({ length: Math.ceil(selectedHotelCodes.length / batchSize) }, (_, index) => selectedHotelCodes.slice(index * batchSize, (index + 1) * batchSize));
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
        const sleep = this.settings.sleep ?? ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)));
        const minRequestIntervalMs = 1000 / maxQps;
        const runningState = createState({
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
        const checkpoint = options.checkpoint ?? (type === "INCREMENTAL" ? existingState.lastSuccessfulCheckpoint : undefined);
        try {
            for (let batchIndex = firstBatch; batchIndex < batches.length; batchIndex += 1) {
                const batchCodes = batches[batchIndex] ?? [];
                let response;
                let lastBatchError;
                for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
                    const elapsedSinceRequest = Date.now() - lastRequestAt;
                    if (lastRequestAt > 0 && elapsedSinceRequest < minRequestIntervalMs) {
                        await sleep(Math.ceil(minRequestIntervalMs - elapsedSinceRequest));
                    }
                    lastRequestAt = Date.now();
                    requestCount += 1;
                    response = await this.gateway.execute({
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
                    if (response.success && response.data !== null)
                        break;
                    const firstError = response.errors[0] ?? {
                        code: client_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
                        message: "Unknown content synchronization error.",
                        retryable: false,
                    };
                    lastBatchError = firstError;
                    if (!firstError.retryable || attempt === maxRetries)
                        break;
                    retryCount += 1;
                    await sleep(retryBaseDelayMs * 2 ** attempt);
                }
                if (!response || !response.success || response.data === null) {
                    failedBatches.add(batchIndex + 1);
                    throw lastBatchError ?? (0, client_1.createHotelbedsIntegrationError)({
                        code: client_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
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
                    if (returnedCodes.has(code))
                        missingHotelCodes.delete(code);
                    else
                        missingHotelCodes.add(code);
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
            const successfulState = createState({
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
        }
        catch (error) {
            const activeBatch = Math.min(lastSuccessfulBatch + 1, batches.length);
            failedBatches.add(activeBatch);
            const mappedError = error && typeof error === "object" && "code" in error && "message" in error
                ? {
                    code: String(error.code ?? client_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR),
                    message: String(error.message ?? "Synchronization failed."),
                    retryable: Boolean(error.retryable ?? false),
                }
                : {
                    code: client_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
                    message: error instanceof Error ? error.message : "Synchronization failed.",
                    retryable: false,
                };
            const failedState = createState({
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
exports.HotelbedsContentSynchronizationService = HotelbedsContentSynchronizationService;
//# sourceMappingURL=hotel-content-synchronization.js.map