export interface Logger {
    info(message: string, ...meta: unknown[]): void;
    warn(message: string, ...meta: unknown[]): void;
    error(message: string, ...meta: unknown[]): void;
}
export declare function initialiseLogging(): Logger;
export declare function getLogger(): Logger;
export declare function flushLogger(): Promise<void>;
//# sourceMappingURL=logging.d.ts.map