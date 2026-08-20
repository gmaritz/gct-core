export type HotelbedsRequestMethod = "GET" | "POST";
export type HotelbedsOperation = "search" | "availability" | "checkRate" | "booking" | "cancellation" | "modification" | "booking-details" | "details" | "content" | "images" | "rates" | "content-sync";
export interface HotelbedsRequest {
    readonly operation: HotelbedsOperation;
    readonly method: HotelbedsRequestMethod;
    readonly path: string;
    readonly query?: Readonly<Record<string, string | number | boolean>>;
    readonly body?: unknown;
    readonly correlationId?: string;
    readonly requestId?: string;
}
//# sourceMappingURL=hotelbeds-request.d.ts.map