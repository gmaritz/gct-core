import {
  createR8EffectiveEnvironment,
  loadR8DotEnv,
  parseLiveVerificationFlag,
  runLiveVerification,
} from "./availability-live-verification";
import { loadHotelbedsIntegrationConfig } from "../../application/accommodation";

export type CertificationVerificationStatus = "DISABLED" | "COMPLETED" | "BLOCKED";
export type CertificationEvidenceStatus = "PASS" | "BLOCKED";

export interface CertificationEvidence {
  readonly technical: CertificationEvidenceStatus;
  readonly security: CertificationEvidenceStatus;
  readonly availability: CertificationEvidenceStatus;
  readonly bookable: CertificationEvidenceStatus;
  readonly recheck: CertificationEvidenceStatus;
  readonly booking: CertificationEvidenceStatus;
  readonly bookingDetails: CertificationEvidenceStatus;
  readonly cancellation: CertificationEvidenceStatus;
  readonly reason?: string;
}

export interface CertificationVerificationReport {
  readonly executionTimestamp: Date;
  readonly environment: string;
  readonly evidence: CertificationEvidence;
  readonly availability?: Readonly<Record<string, unknown>>;
}

export interface CertificationVerificationOutcome {
  readonly status: CertificationVerificationStatus;
  readonly report?: CertificationVerificationReport;
}

export function parseCertificationFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!normalized || normalized === "false" || normalized === "0") return false;
  if (normalized === "true" || normalized === "1") return true;
  throw new Error("Invalid HOTELBEDS_CERTIFICATION_VERIFY value.");
}

function hasTlsConfiguration(environment: NodeJS.ProcessEnv): boolean {
  return Boolean(
    environment.HOTELBEDS_TLS_CLIENT_CERTIFICATE?.trim()
      && environment.HOTELBEDS_TLS_PRIVATE_KEY?.trim(),
  );
}

function controlledScenarioConfigured(environment: NodeJS.ProcessEnv): boolean {
  return Boolean(
    environment.HOTELBEDS_CERTIFICATION_BOOKING_ENABLED?.trim().toLowerCase() === "true"
      && environment.HOTELBEDS_CERTIFICATION_HOTEL_CODE?.trim()
      && environment.HOTELBEDS_CERTIFICATION_RATE_KEY?.trim()
      && environment.HOTELBEDS_CERTIFICATION_RATE_TYPE?.trim(),
  );
}

export async function runCertificationVerification(
  environment: NodeJS.ProcessEnv = process.env,
): Promise<CertificationVerificationOutcome> {
  if (!parseCertificationFlag(environment.HOTELBEDS_CERTIFICATION_VERIFY)) {
    return Object.freeze({ status: "DISABLED" });
  }

  const config = loadHotelbedsIntegrationConfig(environment);
  const tlsConfigured = hasTlsConfiguration(environment);
  const scenarioConfigured = controlledScenarioConfigured(environment);
  const availability = parseLiveVerificationFlag(environment.HOTELBEDS_AVAILABILITY_LIVE_VERIFY)
    ? await runLiveVerification(environment)
    : undefined;
  const evidence: CertificationEvidence = {
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

async function main(): Promise<void> {
  const environment = loadR8DotEnv();
  if (!parseCertificationFlag(environment.HOTELBEDS_CERTIFICATION_VERIFY)) {
    process.stdout.write("Hotelbeds certification verification is disabled.\n");
    return;
  }

  const effectiveEnvironment = createR8EffectiveEnvironment(environment);
  const outcome = await runCertificationVerification(effectiveEnvironment);
  process.stdout.write(`${JSON.stringify(outcome, null, 2)}\n`);
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Hotelbeds certification verification failed.");
    process.exitCode = 1;
  });
}
