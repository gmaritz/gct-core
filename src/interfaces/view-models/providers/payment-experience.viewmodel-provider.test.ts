import { PaymentExperienceViewModelProvider } from "./payment-experience.viewmodel-provider";

describe("PaymentExperienceViewModelProvider", () => {
  it("maps a hosted payment action without exposing provider secrets", (): void => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: "INITIATED",
      reservationId: "reservation-1",
      amount: 12500,
      currency: "ZAR",
      hostedPaymentAction: {
        method: "POST",
        action: "https://sandbox.payfast.co.za/eng/process",
        fields: {
          merchant_id: "10000100",
          amount: "125.00",
          signature: "signed",
        },
      },
      errors: [],
    });

    expect(viewModel.hostedPaymentAction?.method).toBe("POST");
    expect(viewModel.hostedPaymentAction?.action).toContain("payfast.co.za");
    expect(viewModel.hostedPaymentAction?.fields.amount).toBe("125.00");
    expect(viewModel.hostedPaymentAction?.fields.signature).toBe("signed");
    expect(viewModel.hostedPaymentAction?.fields.passphrase).toBeUndefined();
    expect(Object.isFrozen(viewModel.hostedPaymentAction)).toBe(true);
  });
});