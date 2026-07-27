export type NodeEnvironment = "development" | "test" | "production";
export interface AppConfiguration {
    nodeEnv: NodeEnvironment;
    port: number;
    databaseUrl: string;
}
export declare function loadConfiguration(): AppConfiguration;
//# sourceMappingURL=configuration.d.ts.map