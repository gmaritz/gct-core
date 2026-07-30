import { Logger } from "../../../bootstrap/logging";
import { RuntimeService, RuntimeServiceStatus } from "../runtime.service";
import { WorkerService } from "./worker.interface";
export declare class InMemoryWorkerRegistry implements RuntimeService, WorkerService {
    private readonly logger;
    private readonly workers;
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
    register(): void;
    list(): string[];
    lookup(workerName: string): string | undefined;
}
//# sourceMappingURL=worker.registry.d.ts.map