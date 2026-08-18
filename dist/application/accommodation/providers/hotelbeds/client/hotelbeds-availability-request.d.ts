import { HotelbedsRequest } from "./hotelbeds-request";
export interface HotelbedsAvailabilityPax {
    readonly type: "AD" | "CH";
    readonly age?: number;
}
export interface HotelbedsAvailabilityOccupancy {
    readonly rooms: 1;
    readonly adults: number;
    readonly children: number;
    readonly paxes: ReadonlyArray<HotelbedsAvailabilityPax>;
}
export interface HotelbedsAvailabilityRequestBody {
    readonly stay: {
        readonly checkIn: string;
        readonly checkOut: string;
    };
    readonly occupancies: ReadonlyArray<HotelbedsAvailabilityOccupancy>;
    readonly hotels: {
        readonly codes: ReadonlyArray<number>;
    };
    readonly sourceMarket: string;
}
export interface HotelbedsAvailabilityRequest extends Omit<HotelbedsRequest, "method" | "path" | "body"> {
    readonly method: "POST";
    readonly path: "/hotel-api/1.0/hotels";
    readonly body: HotelbedsAvailabilityRequestBody;
}
export interface ResolvedHotelCandidate {
    readonly hotelCode: string;
}
//# sourceMappingURL=hotelbeds-availability-request.d.ts.map