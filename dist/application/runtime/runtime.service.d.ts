export type RuntimeServiceStatus = "INITIALISING" | "RUNNING" | "STOPPED" | "FAILED";
export interface RuntimeService {
    name(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
    health(): Promise<{
        status: string;
        details?: Record<string, unknown>;
    }>;
    status(): RuntimeServiceStatus;
}
//# sourceMappingURL=runtime.service.d.ts.map