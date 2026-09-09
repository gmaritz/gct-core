"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCertificationFlag = parseCertificationFlag;
exports.runCertificationVerification = runCertificationVerification;
const availability_live_verification_1 = require("./availability-live-verification");
const accommodation_1 = require("../../application/accommodation");
function parseCertificationFlag(value) {
    const normalized = value?.trim().toLowerCase() ?? "";
    if (!normalized || normalized === "false" || normalized === "0")
        return false;
    if (normalized === "true" || normalized === "1")
        return true;
    throw new Error("Invalid HOTELBEDS_CERTIFICATION_VERIFY value.");
}
function hasTlsConfiguration(environment) {
    return Boolean(environment.HOTELBEDS_TLS_CLIENT_CERTIFICATE?.trim()
        && environment.HOTELBEDS_TLS_PRIVATE_KEY?.trim());
}
function controlledScenarioConfigured(environment) {
    return Boolean(environment.HOTELBEDS_CERTIFICATION_BOOKING_ENABLED?.trim().toLowerCase() === "true"
        && environment.HOTELBEDS_CERTIFICATION_HOTEL_CODE?.trim()
        && environment.HOTELBEDS_CERTIFICATION_RATE_KEY?.trim()
        && environment.HOTELBEDS_CERTIFICATION_RATE_TYPE?.trim());
}
async function runCertificationVerification(environment = process.env) {
    if (!parseCertificationFlag(environment.HOTELBEDS_CERTIFICATION_VERIFY)) {
        return Object.freeze({ status: "DISABLED" });
    }
    const config = (0, accommodation_1.loadHotelbedsIntegrationConfig)(environment);
    const tlsConfigured = hasTlsConfiguration(environment);
    const scenarioConfigured = controlledScenarioConfigured(environment);
    const availability = (0, availability_live_verification_1.parseLiveVerificationFlag)(environment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY)
        ? await (0, availability_live_verification_1.runLiveVerification)(environment)
        : undefined;
    const evidence = {
        technical: "PASS",
        security: tlsConfigured ? "PASS" : "BLOCKED",
        availability: availability?.status === "COMPLETED" ? "PASS" : "BLOCKED",
        bookable: scenarioConfigured ? "BLOCKED" : "BLOCKED",
        recheck: scenarioConfigured ? "BLOCKED" : "BLOCKED",
        booking: "BLOCKED",
        bookingDetails: "BLOCKED",
        cancellation: "BLOCKED",
        reason: scenarioConfigured
            ? "Controlled booking execution is not enabled by this verification harness; use the approved certification workflow."
            : "No controlled Hotelbeds booking scenario is configured.",
    };
    return Object.freeze({
        status: Object.values(evidence).some((value) => value === "BLOCKED") ? "BLOCKED" : "COMPLETED",
        report: Object.freeze({
            executionTimestamp: new Date(),
            environment: config.environment,
            evidence: Object.freeze(evidence),
            availability: availability?.report ? Object.freeze({ ...availability.report }) : undefined,
        }),
    });
}
async function main() {
    const environment = (0, availability_live_verification_1.loadR8DotEnv)();
    if (!parseCertificationFlag(environment.HOTELBEDS_CERTIFICATION_VERIFY)) {
        process.stdout.write("Hotelbeds certification verification is disabled.\n");
        return;
    }
    const effectiveEnvironment = (0, availability_live_verification_1.createR8EffectiveEnvironment)(environment);
    const outcome = await runCertificationVerification(effectiveEnvironment);
    process.stdout.write(`${JSON.stringify(outcome, null, 2)}\n`);
}
if (require.main === module) {
    void main().catch((error) => {
        console.error(error instanceof Error ? error.message : "Hotelbeds certification verification failed.");
        process.exitCode = 1;
    });
}
//# sourceMappingURL=certification-verification.js.map