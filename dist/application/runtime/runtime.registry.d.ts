import { Logger } from "../../bootstrap/logging";
import { RuntimeService } from "./runtime.service";
export declare class RuntimeRegistry {
    private readonly logger;
    private readonly services;
    constructor(logger: Logger);
    register(service: RuntimeService): void;
    startAll(): Promise<void>;
    stopAll(): Promise<void>;
    health(): Promise<Array<{
        name: string;
        status: string;
        details?: Record<string, unknown>;
    }>>;
    list(): string[];
}
//# sourceMappingURL=runtime.registry.d.ts.map