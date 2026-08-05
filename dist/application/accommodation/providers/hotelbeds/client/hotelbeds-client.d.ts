import { HotelbedsHotel, HotelbedsImage, HotelbedsRate } from "../models";
import { HotelbedsAuthentication } from "./hotelbeds-authentication";
import { HotelbedsRequest } from "./hotelbeds-request";
import { HotelbedsResponse } from "./hotelbeds-response";
export interface HotelbedsClient {
    searchHotels(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>>;
    getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelImages(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>>;
    getHotelRates(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>>;
}
export declare class DefaultHotelbedsClient implements HotelbedsClient {
    private readonly authentication;
    constructor(authentication?: HotelbedsAuthentication);
    searchHotels(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>>;
    getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelImages(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>>;
    getHotelRates(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>>;
}
//# sourceMappingURL=hotelbeds-client.d.ts.map