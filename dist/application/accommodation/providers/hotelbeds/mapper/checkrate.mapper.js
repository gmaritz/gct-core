"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsCheckRateResponse = mapHotelbedsCheckRateResponse;
function asObject(value) {
    return typeof value === "object" && value !== null ? value : undefined;
}
function numberValue(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function findRate(value) {
    const object = asObject(value);
    if (!object)
        return undefined;
    if (typeof object.rateKey === "string" || typeof object.net === "string" || typeof object.sellingRate === "string") {
        return { rate: object, currency: typeof object.currency === "string" ? object.currency : undefined };
    }
    for (const child of Object.values(object)) {
        if (Array.isArray(child)) {
            for (const item of child) {
                const found = findRate(item);
                if (found)
                    return found;
            }
        }
        else {
            const found = findRate(child);
            if (found)
                return found;
        }
    }
    return undefined;
}
function mapStatus(rate, fallback) {
    if (rate.rateType === "RECHECK")
        return "RECHECK_REQUIRED";
    if (typeof rate.allotment === "number" && rate.allotment <= 0)
        return "UNAVAILABLE";
    if (rate.rateType === "BOOKABLE" || typeof rate.allotment === "number")
        return "BOOKABLE";
    return fallback;
}
function childAges(rate, fallback) {
    if (!rate.childrenAges)
        return Object.freeze([...fallback]);
    return Object.freeze(rate.childrenAges.split(/[,|~]/)
        .map((age) => Number.parseInt(age.trim(), 10))
        .filter((age) => Number.isInteger(age) && age >= 0));
}
function mapRate(supplierRate, selected, currency) {
    const reference = Object.freeze({
        provider: selected.reference.provider,
        opaqueReference: supplierRate.rateKey ?? selected.reference.opaqueReference,
    });
    const offeredRoom = selected.occupancy.rooms[0];
    const adults = supplierRate.adults ?? offeredRoom?.adults ?? 0;
    const children = supplierRate.children ?? offeredRoom?.children ?? 0;
    return Object.freeze({
        reference,
        status: mapStatus(supplierRate, selected.status),
        pricing: Object.freeze({
            amount: numberValue(supplierRate.sellingRate ?? supplierRate.net) ?? selected.pricing.amount,
            currency: currency ?? selected.pricing.currency,
            basis: selected.pricing.basis,
        }),
        occupancy: Object.freeze({
            rooms: Object.freeze(Array.from({ length: Math.max(1, supplierRate.rooms ?? selected.occupancy.rooms.length) }, () => Object.freeze({
                adults,
                children,
                childAges: childAges(supplierRate, offeredRoom?.childAges ?? []),
            }))),
        }),
        board: supplierRate.boardCode || supplierRate.boardName
            ? Object.freeze({ code: supplierRate.boardCode, name: supplierRate.boardName })
            : selected.board,
        allotment: supplierRate.allotment ?? selected.allotment,
        payment: supplierRate.paymentType ? Object.freeze({ type: supplierRate.paymentType }) : selected.payment,
        packaging: supplierRate.packaging ?? selected.packaging,
        cancellationPolicies: Object.freeze((supplierRate.cancellationPolicies ?? []).map((policy) => Object.freeze({
            amount: numberValue(policy.amount),
            from: policy.from,
            percent: numberValue(policy.percent),
            numberOfNights: numberValue(policy.numberOfNights),
        }))),
        taxes: Object.freeze((supplierRate.taxes?.taxes ?? []).map((tax) => Object.freeze({
            type: tax.type,
            name: tax.subType,
            amount: numberValue(tax.amount),
            currency: tax.currency,
            included: tax.included,
        }))),
    });
}
function mapHotelbedsCheckRateResponse(payload, selectedRate) {
    const found = findRate(payload);
    if (!found)
        throw new Error("Hotelbeds CheckRate response did not contain a valid rate.");
    return mapRate(found.rate, selectedRate, found.currency);
}
//# sourceMappingURL=checkrate.mapper.js.map