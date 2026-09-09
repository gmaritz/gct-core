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
export declare function parseCertificationFlag(value: string | undefined): boolean;
export declare function runCertificationVerification(environment?: NodeJS.ProcessEnv): Promise<CertificationVerificationOutcome>;
//# sourceMappingURL=certification-verification.d.ts.map