export type HotelbedsRateType = "BOOKABLE" | "RECHECK";
export type HotelbedsTaxType = "TAX" | "FEE" | "TAXESANDFEES";
export interface HotelbedsCancellationPolicy {
    readonly amount?: string;
    readonly from?: string;
    readonly percent?: string;
    readonly numberOfNights?: string;
}
export interface HotelbedsTax {
    readonly included?: boolean;
    readonly percent?: string;
    readonly amount?: string;
    readonly currency?: string;
    readonly type?: HotelbedsTaxType;
    readonly subType?: string;
    readonly clientAmount?: string;
    readonly clientCurrency?: string;
}
export interface HotelbedsTaxes {
    readonly allIncluded?: boolean;
    readonly taxScheme?: "margin" | "general" | string;
    readonly taxes?: ReadonlyArray<HotelbedsTax>;
}
export interface HotelbedsPromotion {
    readonly code?: string;
    readonly name?: string;
    readonly remark?: string;
}
export interface HotelbedsOffer {
    readonly code?: string;
    readonly name?: string;
    readonly amount?: string;
}
export interface HotelbedsRateDiscount {
    readonly code?: string;
    readonly name?: string;
    readonly amount?: string;
}
export interface HotelbedsRateSupplement {
    readonly code?: string;
    readonly name?: string;
    readonly from?: string;
    readonly to?: string;
    readonly amount?: string;
    readonly nights?: number;
    readonly paxNumber?: number;
}
export interface HotelbedsRateBreakDown {
    readonly rateDiscounts?: ReadonlyArray<HotelbedsRateDiscount>;
    readonly rateSupplements?: ReadonlyArray<HotelbedsRateSupplement>;
}
export interface HotelbedsDailyRate {
    readonly offset?: number;
    readonly dailyNet?: string;
    readonly dailySellingRate?: string;
}
export interface HotelbedsShiftRate {
    readonly rateKey?: string;
    readonly rateClass?: string;
    readonly rateType?: HotelbedsRateType;
    readonly net?: string;
    readonly discount?: string;
    readonly discountPCT?: string;
    readonly sellingRate?: string;
    readonly hotelMandatory?: boolean;
    readonly allotment?: number;
    readonly commission?: string;
    readonly commissionVAT?: string;
    readonly commissionPCT?: string;
    readonly checkIn?: string;
    readonly checkOut?: string;
    readonly brand?: string;
    readonly resident?: boolean;
}
export interface HotelbedsOnlineCheckIn {
    readonly url?: string;
    readonly minDaysInAdvance?: number;
}
export interface HotelbedsRate {
    readonly rateKey?: string;
    readonly rateClass?: string;
    readonly rateType?: HotelbedsRateType;
    readonly net?: string;
    readonly discount?: string;
    readonly discountPCT?: string;
    readonly sellingRate?: string;
    readonly hotelMandatory?: boolean;
    readonly allotment?: number;
    readonly commission?: string;
    readonly commissionVAT?: string;
    readonly commissionPCT?: string;
    readonly rateCommentsId?: string;
    readonly rateComments?: string;
    readonly packaging?: boolean;
    readonly boardCode?: string;
    readonly boardName?: string;
    readonly rateBreakDown?: HotelbedsRateBreakDown;
    readonly rooms?: number;
    readonly adults?: number;
    readonly children?: number;
    readonly childrenAges?: string;
    readonly rateup?: string;
    readonly brand?: string;
    readonly resident?: boolean;
    readonly cancellationPolicies?: ReadonlyArray<HotelbedsCancellationPolicy>;
    readonly taxes?: HotelbedsTaxes;
    readonly promotions?: ReadonlyArray<HotelbedsPromotion>;
    readonly offers?: ReadonlyArray<HotelbedsOffer>;
    readonly shiftRates?: ReadonlyArray<HotelbedsShiftRate>;
    readonly dailyRates?: ReadonlyArray<HotelbedsDailyRate>;
    readonly onlineCheckIn?: HotelbedsOnlineCheckIn;
    readonly paymentType?: string;
}
//# sourceMappingURL=hotelbeds-rate.d.ts.map