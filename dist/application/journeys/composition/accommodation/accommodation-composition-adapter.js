"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationCompositionAdapter = void 0;
const accommodation_1 = require("../../../accommodation");
const accommodation_2 = require("../../../accommodation");
const accommodation_3 = require("../../../accommodation");
const accommodation_4 = require("../../../accommodation");
const validation_1 = require("../../validation");
const accommodation_composition_result_1 = require("./accommodation-composition-result");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isFulfilled(result) {
    return result.status === "fulfilled";
}
function toSearchSource(source) {
    switch (source) {
        case validation_1.JourneyCompositionSource.HOMEPAGE:
            return accommodation_1.AccommodationSearchSource.HOMEPAGE_MERCHANDISING;
        case validation_1.JourneyCompositionSource.PACKAGE_DESIGNER:
            return accommodation_1.AccommodationSearchSource.PACKAGE_BUILDER;
        case validation_1.JourneyCompositionSource.PACKAGE_DETAILS:
            return accommodation_1.AccommodationSearchSource.PACKAGE_DETAILS;
        case validation_1.JourneyCompositionSource.ADMIN:
            return accommodation_1.AccommodationSearchSource.ADMIN;
        case validation_1.JourneyCompositionSource.API:
            return accommodation_1.AccommodationSearchSource.API;
        case validation_1.JourneyCompositionSource.INTERNAL:
            return accommodation_1.AccommodationSearchSource.INTERNAL;
        default:
            return accommodation_1.AccommodationSearchSource.INTERNAL;
    }
}
function toInventorySource(source) {
    switch (source) {
        case validation_1.JourneyCompositionSource.HOMEPAGE:
            return accommodation_3.AccommodationInventorySource.HOMEPAGE;
        case validation_1.JourneyCompositionSource.PACKAGE_DESIGNER:
            return accommodation_3.AccommodationInventorySource.PACKAGE_BUILDER;
        case validation_1.JourneyCompositionSource.PACKAGE_DETAILS:
            return accommodation_3.AccommodationInventorySource.PACKAGE_DETAILS;
        case validation_1.JourneyCompositionSource.ADMIN:
            return accommodation_3.AccommodationInventorySource.ADMIN;
        case validation_1.JourneyCompositionSource.API:
            return accommodation_3.AccommodationInventorySource.API;
        case validation_1.JourneyCompositionSource.INTERNAL:
            return accommodation_3.AccommodationInventorySource.INTERNAL;
        default:
            return accommodation_3.AccommodationInventorySource.INTERNAL;
    }
}
function toRateSource(source) {
    switch (source) {
        case validation_1.JourneyCompositionSource.HOMEPAGE:
            return accommodation_4.AccommodationRateSource.HOMEPAGE;
        case validation_1.JourneyCompositionSource.PACKAGE_DESIGNER:
            return accommodation_4.AccommodationRateSource.PACKAGE_BUILDER;
        case validation_1.JourneyCompositionSource.PACKAGE_DETAILS:
            return accommodation_4.AccommodationRateSource.PACKAGE_DETAILS;
        case validation_1.JourneyCompositionSource.ADMIN:
            return accommodation_4.AccommodationRateSource.ADMIN;
        case validation_1.JourneyCompositionSource.API:
            return accommodation_4.AccommodationRateSource.API;
        case validation_1.JourneyCompositionSource.INTERNAL:
            return accommodation_4.AccommodationRateSource.INTERNAL;
        default:
            return accommodation_4.AccommodationRateSource.INTERNAL;
    }
}
function toContentSource(source) {
    switch (source) {
        case validation_1.JourneyCompositionSource.HOMEPAGE:
            return accommodation_2.AccommodationContentSource.HOMEPAGE;
        case validation_1.JourneyCompositionSource.PACKAGE_DESIGNER:
            return accommodation_2.AccommodationContentSource.PACKAGE_BUILDER;
        case validation_1.JourneyCompositionSource.PACKAGE_DETAILS:
            return accommodation_2.AccommodationContentSource.PACKAGE_DETAILS;
        case validation_1.JourneyCompositionSource.ADMIN:
            return accommodation_2.AccommodationContentSource.ADMIN;
        case validation_1.JourneyCompositionSource.API:
            return accommodation_2.AccommodationContentSource.API;
        case validation_1.JourneyCompositionSource.INTERNAL:
            return accommodation_2.AccommodationContentSource.INTERNAL;
        default:
            return accommodation_2.AccommodationContentSource.INTERNAL;
    }
}
function toContentLocale(locale) {
    const normalized = locale?.toUpperCase();
    switch (normalized) {
        case accommodation_2.AccommodationContentLocale.DE:
            return accommodation_2.AccommodationContentLocale.DE;
        case accommodation_2.AccommodationContentLocale.FR:
            return accommodation_2.AccommodationContentLocale.FR;
        case accommodation_2.AccommodationContentLocale.ES:
            return accommodation_2.AccommodationContentLocale.ES;
        case accommodation_2.AccommodationContentLocale.NL:
            return accommodation_2.AccommodationContentLocale.NL;
        default:
            return accommodation_2.AccommodationContentLocale.EN;
    }
}
function createSearchQuery(context) {
    const searchContext = {
        requestId: context.requestId,
        source: toSearchSource(context.source),
        channel: context.channel ?? "WEB",
        locale: context.locale ?? "EN",
        currency: context.currency ?? accommodation_4.AccommodationCurrency.ZAR,
        timestamp: context.timestamp,
    };
    return Object.freeze({
        criteria: {
            destination: context.destination,
            checkInDate: context.checkInDate,
            checkOutDate: context.checkOutDate,
            adults: context.adults,
            children: context.children,
            rooms: context.rooms,
            category: context.preferences?.category,
            minimumRating: context.preferences?.minimumRating,
            amenities: context.preferences?.amenities,
            collections: context.preferences?.collections,
        },
        context: searchContext,
    });
}
function createContentQuery(context, identifier) {
    const contentContext = {
        requestId: context.requestId,
        source: toContentSource(context.source),
        locale: toContentLocale(context.locale),
        timestamp: context.timestamp,
    };
    return Object.freeze({
        identifier,
        context: contentContext,
    });
}
function createInventoryQuery(context, identifier) {
    const inventoryContext = {
        requestId: context.requestId,
        source: toInventorySource(context.source),
        timestamp: context.timestamp,
    };
    return Object.freeze({
        identifier,
        checkInDate: context.checkInDate,
        checkOutDate: context.checkOutDate,
        adults: context.adults,
        children: context.children,
        rooms: context.rooms,
        context: inventoryContext,
    });
}
function createRateQuery(context, identifier) {
    const rateContext = {
        requestId: context.requestId,
        source: toRateSource(context.source),
        currency: context.currency ?? accommodation_4.AccommodationCurrency.ZAR,
        market: context.market ?? "ZA",
        timestamp: context.timestamp,
    };
    return Object.freeze({
        identifier,
        stayPeriod: {
            checkIn: context.checkInDate,
            checkOut: context.checkOutDate,
        },
        occupancy: {
            adults: context.adults,
            children: context.children,
            rooms: context.rooms,
        },
        selectionStrategy: accommodation_4.AccommodationRateSelectionStrategy.RECOMMENDED,
        context: rateContext,
    });
}
function toJourneyAccommodation(accommodation, contentResult, inventoryResult, context) {
    const accommodationId = accommodation.identity.id;
    const resolvedName = contentResult?.accommodation.identity.name ?? accommodation.identity.name;
    if (isBlank(accommodationId) || isBlank(resolvedName)) {
        return undefined;
    }
    const positiveResult = inventoryResult.kind === "ACCOMMODATION" ? inventoryResult : undefined;
    const roomOptions = positiveResult?.availabilityOptions?.roomOptions;
    const provider = accommodation.providerReference.provider;
    const option = {
        accommodationId,
        name: resolvedName,
        ...(context.packageStop ? { packageStop: context.packageStop } : {}),
        ...(roomOptions || context.packageStop || positiveResult?.requestedOccupancy || context.occupancy
            ? { provider }
            : {}),
        ...(roomOptions && roomOptions.length > 0 ? { roomOptions } : {}),
        ...(positiveResult?.requestedOccupancy || context.occupancy
            ? { requestedOccupancy: positiveResult?.requestedOccupancy ?? context.occupancy }
            : {}),
    };
    return Object.freeze(option);
}
class AccommodationCompositionAdapter {
    constructor(discoveryService, contentService, inventoryService, rateService) {
        this.discoveryService = discoveryService;
        this.contentService = contentService;
        this.inventoryService = inventoryService;
        this.rateService = rateService;
    }
    static fromServices(discoveryService, contentService, inventoryService, rateService) {
        return new AccommodationCompositionAdapter(discoveryService, contentService, inventoryService, rateService);
    }
    async compose(context) {
        const [discoveryExecution] = await Promise.allSettled([
            this.discoveryService.search(createSearchQuery(context)),
        ]);
        if (!discoveryExecution || !isFulfilled(discoveryExecution)) {
            return (0, accommodation_composition_result_1.createAccommodationCompositionResult)([]);
        }
        const candidateCompositions = await Promise.allSettled(discoveryExecution.value.accommodations.map((accommodation) => this.composeAccommodation(accommodation, context)));
        const journeyAccommodations = candidateCompositions
            .filter(isFulfilled)
            .map((result) => result.value)
            .filter((value) => typeof value !== "undefined");
        return (0, accommodation_composition_result_1.createAccommodationCompositionResult)(journeyAccommodations);
    }
    async composeAccommodation(accommodation, context) {
        const accommodationId = accommodation.identity.id;
        const [contentExecution, inventoryExecution, rateExecution] = await Promise.allSettled([
            this.contentService.execute(createContentQuery(context, accommodationId)),
            this.inventoryService.execute(createInventoryQuery(context, accommodationId)),
            this.rateService.execute(createRateQuery(context, accommodationId)),
        ]);
        const inventoryResult = isFulfilled(inventoryExecution)
            ? inventoryExecution.value
            : undefined;
        const rateResult = isFulfilled(rateExecution)
            ? rateExecution.value
            : undefined;
        const contentResult = isFulfilled(contentExecution)
            ? contentExecution.value
            : undefined;
        if (!inventoryResult || inventoryResult.kind !== "ACCOMMODATION" || !inventoryResult.available) {
            return undefined;
        }
        if (!rateResult || rateResult.rates.length === 0) {
            return undefined;
        }
        return toJourneyAccommodation(accommodation, contentResult, inventoryResult, context);
    }
}
exports.AccommodationCompositionAdapter = AccommodationCompositionAdapter;
//# sourceMappingURL=accommodation-composition-adapter.js.map