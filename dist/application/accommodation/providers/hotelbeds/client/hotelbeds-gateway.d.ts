import { HotelbedsAuthentication } from "./hotelbeds-authentication";
import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";
import { HotelbedsIntegrationResult } from "./hotelbeds-integration-result";
import { HotelbedsRequest } from "./hotelbeds-request";
import { HotelbedsTransport } from "./hotelbeds-transport";
export interface HotelbedsGateway {
    execute<T>(request: HotelbedsRequest): Promise<HotelbedsIntegrationResult<T>>;
}
export declare class DefaultHotelbedsGateway implements HotelbedsGateway {
    private readonly configLoader;
    private readonly authentication;
    private readonly transport;
    constructor(configLoader?: () => HotelbedsIntegrationConfig, authentication?: HotelbedsAuthentication, transport?: HotelbedsTransport);
    execute<T>(request: HotelbedsRequest): Promise<HotelbedsIntegrationResult<T>>;
}
//# sourceMappingURL=hotelbeds-gateway.d.ts.map