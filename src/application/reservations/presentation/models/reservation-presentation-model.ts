export interface ReservationJourneyPresentationSummary {
  readonly journeyId: string;
  readonly title: string;
  readonly destination: string;
  readonly duration: string;
}

export interface ReservationTravellerPresentationSummary {
  readonly travellerCount: number;
  readonly leadTraveller: string;
}

export interface ReservationPricingPresentationSummary {
  readonly amount: number;
  readonly currency: string;
  readonly display: string;
}

export interface ReservationPaymentPresentationSummary {
  readonly paymentStatus: string;
  readonly amountReceived: number;
  readonly balanceOutstanding: number;
  readonly progressLabel: string;
}

export interface ReservationPresentationMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId: string;
}

export interface ReservationPresentationModel {
  readonly reservationNumber: string;
  readonly journey: ReservationJourneyPresentationSummary;
  readonly travellers: ReservationTravellerPresentationSummary;
  readonly accommodationSummary: string;
  readonly pricingSummary?: ReservationPricingPresentationSummary;
  readonly paymentSummary?: ReservationPaymentPresentationSummary;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: ReservationPresentationMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeJourney(
  journey: ReservationJourneyPresentationSummary,
): ReservationJourneyPresentationSummary {
  return Object.freeze({
    journeyId: journey.journeyId,
    title: journey.title,
    destination: journey.destination,
    duration: journey.duration,
  });
}

function freezeTravellers(
  travellers: ReservationTravellerPresentationSummary,
): ReservationTravellerPresentationSummary {
  return Object.freeze({
    travellerCount: travellers.travellerCount,
    leadTraveller: travellers.leadTraveller,
  });
}

function freezePricing(
  pricing: ReservationPricingPresentationSummary | undefined,
): ReservationPricingPresentationSummary | undefined {
  if (!pricing) {
    return undefined;
  }

  return Object.freeze({
    amount: pricing.amount,
    currency: pricing.currency,
    display: pricing.display,
  });
}

function freezePayment(
  payment: ReservationPaymentPresentationSummary | undefined,
): ReservationPaymentPresentationSummary | undefined {
  if (!payment) {
    return undefined;
  }

  return Object.freeze({
    paymentStatus: payment.paymentStatus,
    amountReceived: payment.amountReceived,
    balanceOutstanding: payment.balanceOutstanding,
    progressLabel: payment.progressLabel,
  });
}

export function createReservationPresentationModel(
  model: ReservationPresentationModel,
): ReservationPresentationModel {
  return Object.freeze({
    reservationNumber: model.reservationNumber,
    journey: freezeJourney(model.journey),
    travellers: freezeTravellers(model.travellers),
    accommodationSummary: model.accommodationSummary,
    pricingSummary: freezePricing(model.pricingSummary),
    paymentSummary: freezePayment(model.paymentSummary),
    warnings: Object.freeze([...model.warnings]),
    metadata: Object.freeze({
      generatedAt: cloneDate(model.metadata.generatedAt),
      version: model.metadata.version,
      requestId: model.metadata.requestId,
    }),
  });
}
