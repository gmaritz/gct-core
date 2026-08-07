"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentInstrument = createPaymentInstrument;
function createPaymentInstrument(instrument) {
    return Object.freeze({
        instrumentType: instrument.instrumentType,
        maskedIdentifier: instrument.maskedIdentifier,
        holderName: instrument.holderName,
        expiryMonth: instrument.expiryMonth,
        expiryYear: instrument.expiryYear,
    });
}
//# sourceMappingURL=payment-instrument.js.map