import { Logger } from "../../../bootstrap/logging";
import { RuntimeService, RuntimeServiceStatus } from "../runtime.service";
import { SchedulerService } from "./scheduler.interface";
export declare class InMemorySchedulerService implements RuntimeService, SchedulerService {
    private readonly logger;
    private readonly jobs;
    private runtimeStatus;
    constructor(logger: Logger);
    name(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
    health(): Promise<{
        status: string;
        details?: Record<string, unknown>;
    }>;
    status(): RuntimeServiceStatus;
    registerJob(jobName: string): void;
    removeJob(jobName: string): void;
    listJobs(): string[];
}
//# sourceMappingURL=scheduler.service.d.ts.map