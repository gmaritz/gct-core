export type HotelbedsRequestMethod = "GET" | "POST";
export type HotelbedsOperation = "search" | "details" | "content" | "images" | "rates";
export interface HotelbedsRequest {
    readonly operation: HotelbedsOperation;
    readonly method: HotelbedsRequestMethod;
    readonly path: string;
    readonly query?: Readonly<Record<string, string | number | boolean>>;
    readonly body?: unknown;
}
//# sourceMappingURL=hotelbeds-request.d.ts.map