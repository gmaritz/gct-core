import { Logger } from "./logging";
export interface LifecycleHooks {
    beforeShutdown?: () => Promise<void>;
}
export declare function registerLifecycleHandlers(logger: Logger, hooks?: LifecycleHooks): void;
//# sourceMappingURL=lifecycle.d.ts.map