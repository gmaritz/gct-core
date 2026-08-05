import { HotelbedsRequest } from "./hotelbeds-request";
export interface HotelbedsAuthentication {
    prepareHeaders(request: HotelbedsRequest): Readonly<Record<string, string>>;
}
export declare class DefaultHotelbedsAuthentication implements HotelbedsAuthentication {
    prepareHeaders(request: HotelbedsRequest): Readonly<Record<string, string>>;
}
//# sourceMappingURL=hotelbeds-authentication.d.ts.map