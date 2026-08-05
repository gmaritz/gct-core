import { HotelbedsRequest } from "./hotelbeds-request";

export interface HotelbedsAuthentication {
  prepareHeaders(request: HotelbedsRequest): Readonly<Record<string, string>>;
}

export class DefaultHotelbedsAuthentication implements HotelbedsAuthentication {
  public prepareHeaders(request: HotelbedsRequest): Readonly<Record<string, string>> {
    return Object.freeze({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-GCT-Provider": "hotelbeds-placeholder",
      "X-GCT-Operation": request.operation,
    });
  }
}