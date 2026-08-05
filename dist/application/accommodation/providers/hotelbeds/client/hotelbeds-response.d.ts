import { HotelbedsRequest } from "./hotelbeds-request";
export interface HotelbedsResponse<T> {
    readonly request: HotelbedsRequest;
    readonly status: number;
    readonly data: T;
    readonly headers?: Readonly<Record<string, string>>;
}
//# sourceMappingURL=hotelbeds-response.d.ts.map