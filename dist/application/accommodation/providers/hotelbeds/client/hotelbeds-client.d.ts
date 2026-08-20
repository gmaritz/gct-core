import { HotelbedsHotel, HotelbedsImage, HotelbedsRate } from "../models";
import { HotelbedsGateway } from "./hotelbeds-gateway";
import { HotelbedsRequest } from "./hotelbeds-request";
import { HotelbedsResponse } from "./hotelbeds-response";
export interface HotelbedsClient {
    searchHotels(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>>;
    getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelImages(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>>;
    getHotelRates(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>>;
    checkRate?(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    book?(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    cancel?(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    modify?(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
}
export declare class DefaultHotelbedsClient implements HotelbedsClient {
    private readonly gateway;
    constructor(gateway?: HotelbedsGateway);
    searchHotels(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsHotel>>>;
    getHotelDetails(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelContent(request: HotelbedsRequest): Promise<HotelbedsResponse<HotelbedsHotel>>;
    getHotelImages(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsImage>>>;
    getHotelRates(request: HotelbedsRequest): Promise<HotelbedsResponse<ReadonlyArray<HotelbedsRate>>>;
    checkRate(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    book(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    cancel(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
    modify(request: HotelbedsRequest): Promise<HotelbedsResponse<unknown>>;
}
//# sourceMappingURL=hotelbeds-client.d.ts.map