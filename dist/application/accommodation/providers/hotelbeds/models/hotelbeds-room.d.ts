import { HotelbedsFacility } from "./hotelbeds-facility";
import { HotelbedsRate } from "./hotelbeds-rate";
export type HotelbedsRoomStatus = "CONFIRMED" | "CANCELLED";
export type HotelbedsPaxType = "AD" | "CH";
export interface HotelbedsPax {
    readonly roomId?: number;
    readonly type: HotelbedsPaxType;
    readonly age?: number;
    readonly name?: string;
    readonly surname?: string;
}
export interface HotelbedsRoom {
    readonly status?: HotelbedsRoomStatus;
    readonly id?: number;
    readonly code?: string;
    readonly name?: string;
    readonly roomType?: string;
    readonly characteristicCode?: string;
    readonly characteristicName?: string;
    readonly minPax?: number;
    readonly maxPax?: number;
    readonly minAdults?: number;
    readonly maxAdults?: number;
    readonly minChildren?: number;
    readonly maxChildren?: number;
    readonly paxes?: ReadonlyArray<HotelbedsPax>;
    readonly supplierReference?: string;
    readonly facilities?: ReadonlyArray<HotelbedsFacility>;
    readonly roomFacilities?: ReadonlyArray<HotelbedsFacility>;
    readonly rates?: ReadonlyArray<HotelbedsRate>;
    readonly PMSRoomCode?: string;
    readonly roomCode?: string;
}
//# sourceMappingURL=hotelbeds-room.d.ts.map