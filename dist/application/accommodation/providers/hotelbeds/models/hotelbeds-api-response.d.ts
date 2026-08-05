export interface HotelbedsApiAuditData {
    readonly processTime?: string;
    readonly timestamp?: string;
    readonly requestHost?: string;
    readonly serverId?: string;
    readonly environment?: string;
    readonly release?: string;
    readonly token?: string;
    readonly internal?: string;
}
export interface HotelbedsApiError {
    readonly code: string;
    readonly message?: string;
}
export interface HotelbedsApiResponse<T> {
    readonly auditData: HotelbedsApiAuditData;
    readonly error?: HotelbedsApiError;
    readonly payload?: T;
}
//# sourceMappingURL=hotelbeds-api-response.d.ts.map