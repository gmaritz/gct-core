export interface ServerConfig {
    port: number;
    host: string;
    corsEnabled: boolean;
    requestIdHeader: string;
}
export declare function createServerConfig(port: number, corsEnabled: boolean): ServerConfig;
//# sourceMappingURL=server.config.d.ts.map