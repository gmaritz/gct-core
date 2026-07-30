import { Logger } from "../../bootstrap/logging";
import { RuntimeRegistry } from "./runtime.registry";
import { RuntimeService } from "./runtime.service";
export declare class RuntimeManager {
    private readonly logger;
    private readonly registry;
    private started;
    constructor(logger: Logger);
    register(service: RuntimeService): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    health(): Promise<{
        status: string;
        services: Array<{
            name: string;
            status: string;
            details?: Record<string, unknown>;
        }>;
    }>;
    getRegistry(): RuntimeRegistry;
}
//# sourceMappingURL=runtime.manager.d.ts.map