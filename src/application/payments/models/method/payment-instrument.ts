export interface PaymentInstrument {
  readonly instrumentType: string;
  readonly maskedIdentifier: string;
  readonly holderName?: string;
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
}

export function createPaymentInstrument(instrument: PaymentInstrument): PaymentInstrument {
  return Object.freeze({
    instrumentType: instrument.instrumentType,
    maskedIdentifier: instrument.maskedIdentifier,
    holderName: instrument.holderName,
    expiryMonth: instrument.expiryMonth,
    expiryYear: instrument.expiryYear,
  });
}
