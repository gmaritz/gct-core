import { JourneyAccommodationPricingInput } from "../../journeys/models";
import { Currency } from "../models";
import { PricingValidationRequest } from "../validation";
export interface AccommodationPricingComponent {
    readonly packageStopId: string;
    readonly accommodationId: string;
    readonly roomReference: string;
    readonly rateReference: string;
    readonly provider: string;
    readonly amount: number;
    readonly currency: Currency;
    readonly pricingBasis: string;
    readonly occupancyRoomCount: number;
    readonly childAges: ReadonlyArray<number>;
}
export declare function createAccommodationPricingComponents(inputs: ReadonlyArray<JourneyAccommodationPricingInput>): ReadonlyArray<AccommodationPricingComponent>;
export declare function withAccommodationPricingInputs(request: PricingValidationRequest, inputs: ReadonlyArray<JourneyAccommodationPricingInput>): PricingValidationRequest;
//# sourceMappingURL=accommodation-pricing-input.d.ts.map