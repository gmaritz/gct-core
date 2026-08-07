import { PricingValidationRequest } from "../../validation";

export interface PricingPolicyContext {
  readonly pricingRequest: PricingValidationRequest;
  readonly journeySummary: {
    readonly journeyId: string;
    readonly productType: string;
    readonly destination?: string;
  };
  readonly travellerInformation: {
    readonly travellerCount: number;
    readonly residentCountry?: string;
  };
  readonly commercialMetadata: Readonly<Record<string, string>>;
  readonly market: string;
  readonly salesChannel: string;
  readonly bookingDate: Date;
}

export function createPricingPolicyContext(context: PricingPolicyContext): PricingPolicyContext {
  return Object.freeze({
    pricingRequest: context.pricingRequest,
    journeySummary: Object.freeze({
      journeyId: context.journeySummary.journeyId,
      productType: context.journeySummary.productType,
      destination: context.journeySummary.destination,
    }),
    travellerInformation: Object.freeze({
      travellerCount: context.travellerInformation.travellerCount,
      residentCountry: context.travellerInformation.residentCountry,
    }),
    commercialMetadata: Object.freeze({ ...context.commercialMetadata }),
    market: context.market,
    salesChannel: context.salesChannel,
    bookingDate: new Date(context.bookingDate.getTime()),
  });
}
