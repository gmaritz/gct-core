"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInitialPaymentRequirementSnapshot = parseInitialPaymentRequirementSnapshot;
exports.initialPaymentRequirementMatchesPricingSnapshot = initialPaymentRequirementMatchesPricingSnapshot;
function asRecord(value, label) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`${label} must be an object.`);
    }
    return value;
}
function assertKeys(record, allowed, label) {
    if (Object.keys(record).some((key) => !allowed.includes(key))) {
        throw new Error(`${label} contains unsupported fields.`);
    }
}
function requiredString(record, key, label) {
    const value = record[key];
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label}.${key} must be a non-empty string.`);
    }
    return value;
}
function parseMoney(value, label) {
    const record = asRecord(value, label);
    assertKeys(record, ["amount", "currency"], label);
    if (typeof record.amount !== "number" || !Number.isFinite(record.amount) || record.amount < 0) {
        throw new Error(`${label}.amount must be a non-negative finite number.`);
    }
    const currency = requiredString(record, "currency", label);
    return Object.freeze({ amount: record.amount, currency });
}
function parsePolicy(value, label) {
    const record = asRecord(value, label);
    assertKeys(record, [
        "policyId", "version", "appliedRate", "scope", "effectiveFrom", "effectiveTo",
        "leadTimeThresholdDays", "commercialTimeZone",
    ], label);
    const policyId = requiredString(record, "policyId", label);
    const version = requiredString(record, "version", label);
    const appliedRate = requiredString(record, "appliedRate", label);
    const scope = requiredString(record, "scope", label);
    const effectiveFrom = parseDateOnly(requiredString(record, "effectiveFrom", label), `${label}.effectiveFrom`);
    const effectiveTo = record.effectiveTo === undefined
        ? undefined
        : parseDateOnly(requiredString(record, "effectiveTo", label), `${label}.effectiveTo`);
    const commercialTimeZone = requiredString(record, "commercialTimeZone", label);
    if (!/^\d+\.\d+\.\d+$/.test(version)
        || !/^\d+(?:\.\d+)?$/.test(appliedRate)
        || Number(appliedRate) <= 0
        || Number(appliedRate) > 1
        || !Number.isInteger(record.leadTimeThresholdDays)
        || record.leadTimeThresholdDays < 1) {
        throw new Error(`${label} contains invalid policy parameters.`);
    }
    if (effectiveTo && effectiveTo < effectiveFrom) {
        throw new Error(`${label}.effectiveTo must not precede effectiveFrom.`);
    }
    return Object.freeze({
        policyId,
        version,
        appliedRate,
        scope,
        effectiveFrom,
        effectiveTo,
        leadTimeThresholdDays: record.leadTimeThresholdDays,
        commercialTimeZone,
    });
}
function parseFutureBalance(value) {
    const future = asRecord(value, "contractualFutureBalance");
    assertKeys(future, ["amount", "dueDate"], "contractualFutureBalance");
    return Object.freeze({
        amount: parseMoney(future.amount, "contractualFutureBalance.amount"),
        dueDate: parseDateOnly(future.dueDate, "contractualFutureBalance.dueDate"),
    });
}
function parseDateOnly(value, label) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`${label} must be an ISO calendar date.`);
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new Error(`${label} must be a valid ISO calendar date.`);
    }
    return value;
}
function parseInitialPaymentRequirementSnapshot(value) {
    const record = asRecord(value, "Initial payment requirement");
    assertKeys(record, [
        "classification", "amountPayableAtBooking", "contractualFutureBalance", "pricingSnapshotId",
        "commercialPolicy", "calculationBasis",
    ], "Initial payment requirement");
    if (record.classification !== "PARTIAL_PAYMENT" && record.classification !== "FULL_PAYMENT") {
        throw new Error("Initial payment requirement classification is invalid.");
    }
    const amountPayableAtBooking = parseMoney(record.amountPayableAtBooking, "amountPayableAtBooking");
    const contractualFutureBalance = record.contractualFutureBalance === undefined
        ? undefined
        : parseFutureBalance(record.contractualFutureBalance);
    const pricingSnapshotId = requiredString(record, "pricingSnapshotId", "initialRequirement");
    const commercialPolicy = parsePolicy(record.commercialPolicy, "commercialPolicy");
    const basis = asRecord(record.calculationBasis, "calculationBasis");
    assertKeys(basis, [
        "commercialPolicy", "bookingDate", "departureDate", "leadTimeDays", "commercialTimeZone",
        "gctComponent", "accommodationComponents",
    ], "calculationBasis");
    const basisPolicy = parsePolicy(basis.commercialPolicy, "calculationBasis.commercialPolicy");
    if (basisPolicy.policyId !== commercialPolicy.policyId
        || basisPolicy.version !== commercialPolicy.version
        || basisPolicy.appliedRate !== commercialPolicy.appliedRate
        || basisPolicy.scope !== commercialPolicy.scope
        || basisPolicy.effectiveFrom !== commercialPolicy.effectiveFrom
        || basisPolicy.effectiveTo !== commercialPolicy.effectiveTo
        || basisPolicy.leadTimeThresholdDays !== commercialPolicy.leadTimeThresholdDays
        || basisPolicy.commercialTimeZone !== commercialPolicy.commercialTimeZone) {
        throw new Error("Initial payment requirement policy identity is inconsistent.");
    }
    if (!Number.isInteger(basis.leadTimeDays) || basis.leadTimeDays < 0) {
        throw new Error("Initial payment requirement lead time is invalid.");
    }
    const gct = asRecord(basis.gctComponent, "calculationBasis.gctComponent");
    assertKeys(gct, [
        "sourcePricingLineIdentifier", "amount", "costingSourceId", "costingSourceVersion",
        "costingSourceEffectiveDate",
    ], "calculationBasis.gctComponent");
    const gctComponent = Object.freeze({
        sourcePricingLineIdentifier: requiredString(gct, "sourcePricingLineIdentifier", "gctComponent"),
        amount: parseMoney(gct.amount, "gctComponent.amount"),
        costingSourceId: requiredString(gct, "costingSourceId", "gctComponent"),
        costingSourceVersion: requiredString(gct, "costingSourceVersion", "gctComponent"),
        costingSourceEffectiveDate: parseDateOnly(gct.costingSourceEffectiveDate, "costingSourceEffectiveDate"),
    });
    if (!Array.isArray(basis.accommodationComponents)) {
        throw new Error("Initial payment requirement accommodation components must be an array.");
    }
    const accommodationComponents = Object.freeze(basis.accommodationComponents.map((item, index) => {
        const component = asRecord(item, `accommodationComponents[${index}]`);
        assertKeys(component, ["packageStopId", "sourcePricingLineIdentifier", "amount"], `accommodationComponents[${index}]`);
        return Object.freeze({
            packageStopId: requiredString(component, "packageStopId", "accommodationComponent"),
            sourcePricingLineIdentifier: requiredString(component, "sourcePricingLineIdentifier", "accommodationComponent"),
            amount: parseMoney(component.amount, `accommodationComponents[${index}].amount`),
        });
    }));
    if (accommodationComponents.length === 0
        || new Set(accommodationComponents.map((component) => component.packageStopId)).size !== accommodationComponents.length
        || accommodationComponents.some((component) => component.sourcePricingLineIdentifier !== `ACCOMMODATION:${component.packageStopId}`)) {
        throw new Error("Initial payment requirement accommodation components are invalid.");
    }
    const calculationBasis = Object.freeze({
        commercialPolicy: basisPolicy,
        bookingDate: parseDateOnly(basis.bookingDate, "bookingDate"),
        departureDate: parseDateOnly(basis.departureDate, "departureDate"),
        leadTimeDays: basis.leadTimeDays,
        commercialTimeZone: requiredString(basis, "commercialTimeZone", "calculationBasis"),
        gctComponent,
        accommodationComponents,
    });
    if (gctComponent.sourcePricingLineIdentifier !== "BASE"
        || calculationBasis.commercialTimeZone !== commercialPolicy.commercialTimeZone) {
        throw new Error("Initial payment requirement calculation basis is inconsistent.");
    }
    if (gctComponent.costingSourceEffectiveDate > calculationBasis.bookingDate) {
        throw new Error("Initial payment requirement costing source is not effective on the booking date.");
    }
    return Object.freeze({
        classification: record.classification,
        amountPayableAtBooking,
        contractualFutureBalance,
        pricingSnapshotId,
        commercialPolicy,
        calculationBasis,
    });
}
function toMinorUnits(value) {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));
    if (!match)
        return undefined;
    return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}
function initialPaymentRequirementMatchesPricingSnapshot(requirement, pricing) {
    if (requirement.pricingSnapshotId !== pricing.snapshotId)
        return false;
    const total = toMinorUnits(pricing.totalPrice);
    const payable = toMinorUnits(requirement.amountPayableAtBooking.amount);
    const gct = toMinorUnits(requirement.calculationBasis.gctComponent.amount.amount);
    if (total === undefined || payable === undefined || gct === undefined
        || total <= 0n || payable <= 0n || payable > total || gct <= 0n)
        return false;
    if (requirement.amountPayableAtBooking.currency !== pricing.currency
        || requirement.calculationBasis.gctComponent.amount.currency !== pricing.currency
        || requirement.calculationBasis.accommodationComponents.some((component) => component.amount.currency !== pricing.currency)) {
        return false;
    }
    let componentsTotal = gct;
    for (const component of requirement.calculationBasis.accommodationComponents) {
        const amount = toMinorUnits(component.amount.amount);
        if (amount === undefined || amount <= 0n)
            return false;
        componentsTotal += amount;
    }
    if (componentsTotal !== total)
        return false;
    const future = requirement.contractualFutureBalance
        ? toMinorUnits(requirement.contractualFutureBalance.amount.amount)
        : undefined;
    if (requirement.contractualFutureBalance
        && requirement.contractualFutureBalance.amount.currency !== pricing.currency)
        return false;
    if (requirement.classification === "FULL_PAYMENT")
        return payable === total && future === undefined;
    return payable < total && future !== undefined && future > 0n && payable + future === total;
}
//# sourceMappingURL=payment-snapshot.js.map