export interface PlatformInfo {
    service: string;
    name: string;
    version: string;
    environment: string;
}
export interface VersionInfo {
    service: string;
    version: string;
    environment: string;
    build: string;
    timestamp: string;
}
export interface StartupInfo {
    service: string;
    name: string;
    version: string;
    build: string;
    environment: string;
    nodeVersion: string;
    port: number;
    startupTimestamp: string;
    startupDurationMs: number;
}
export declare class PlatformInfoService {
    getPlatformInfo(): PlatformInfo;
    getVersionInfo(): VersionInfo;
    getStartupInfo(port: number, startupDurationMs: number): StartupInfo;
    getUptime(): number;
}
//# sourceMappingURL=platform-info.service.d.ts.map