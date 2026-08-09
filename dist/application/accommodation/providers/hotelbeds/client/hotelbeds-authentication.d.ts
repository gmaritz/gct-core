import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";
import { HotelbedsRequest } from "./hotelbeds-request";
export interface HotelbedsClock {
    now(): Date;
}
export declare class SystemHotelbedsClock implements HotelbedsClock {
    now(): Date;
}
export interface HotelbedsAuthentication {
    prepareHeaders(request: HotelbedsRequest, context?: {
        readonly correlationId?: string;
        readonly requestId?: string;
    }): Readonly<Record<string, string>>;
}
export declare class DefaultHotelbedsAuthentication implements HotelbedsAuthentication {
    private readonly configLoader;
    private readonly clock;
    constructor(configLoader?: () => HotelbedsIntegrationConfig, clock?: HotelbedsClock);
    prepareHeaders(request: HotelbedsRequest, context?: {
        readonly correlationId?: string;
        readonly requestId?: string;
    }): Readonly<Record<string, string>>;
}
export declare function createHotelbedsSignature(apiKey: string, secret: string, timestamp: string): string;
//# sourceMappingURL=hotelbeds-authentication.d.ts.map