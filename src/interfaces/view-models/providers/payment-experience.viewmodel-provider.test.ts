import { PaymentExperienceViewModelProvider } from "./payment-experience.viewmodel-provider";
import { PaymentStatus } from "../../../application/payments";

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

  it("identifies simulated supplier fulfilment as a test-only result", (): void => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: "UNAVAILABLE",
      reservationId: "reservation-1",
      errors: [],
    }, "journey-1", true);

    expect(viewModel.supplierFulfilmentNotice)
      .toBe("Test only: accommodation supplier fulfilment was simulated. No Hotelbeds booking was created.");
  });

  it("shows a verified cancelled attempt separately from the unchanged reservation payment snapshot", (): void => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: PaymentStatus.CANCELLED,
      reservationId: "reservation-1",
      paymentStatus: PaymentStatus.CANCELLED,
      amount: 125,
      currency: "ZAR",
      errors: [],
    }, "journey-1", false, {
      status: PaymentStatus.CANCELLED,
      reservationPaymentStatus: "PENDING",
      balanceOutstanding: 125,
    });

    expect(viewModel.status).toBe("CANCELLED");
    expect(viewModel.paymentAttemptStatus).toBe("CANCELLED");
    expect(viewModel.reservationPaymentStatus).toBe("PENDING");
    expect(viewModel.balanceOutstanding).toBe(125);
    expect(viewModel.message).toContain("reservation payment balance remains unchanged");
    expect(viewModel.confirmationAction).toBeUndefined();
  });

  it("does not offer confirmation when an attempt is complete but the reservation snapshot is not", (): void => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: PaymentStatus.COMPLETED,
      reservationId: "reservation-1",
      errors: [],
    }, "journey-1", false, {
      status: PaymentStatus.COMPLETED,
      reservationPaymentStatus: "PENDING",
      balanceOutstanding: 125,
    });

    expect(viewModel.confirmationAction).toBeUndefined();
  });

  it("uses the reservation snapshot for confirmation even if this specific attempt is pending", (): void => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: "PENDING",
      reservationId: "reservation-1",
      errors: [],
    }, "journey-1", false, {
      status: PaymentStatus.AUTHORIZATION_REQUESTED,
      reservationPaymentStatus: "COMPLETED",
      balanceOutstanding: 0,
    });

    expect(viewModel.status).toBe("PENDING");
    expect(viewModel.confirmationAction?.href).toBe("/ui/journeys/journey-1/confirmation");
  });

  it.each([
    [PaymentStatus.CREATED, "PENDING"],
    [PaymentStatus.AUTHORIZATION_REQUESTED, "PENDING"],
    [PaymentStatus.AUTHORIZATION_FAILED, "FAILED"],
    [PaymentStatus.COMPLETED, "COMPLETED"],
    [PaymentStatus.CANCELLED, "CANCELLED"],
  ] as const)("presents the specific %s PaymentAttempt status", (attemptStatus, expectedStatus) => {
    const viewModel = new PaymentExperienceViewModelProvider().provide({
      status: "PENDING",
      reservationId: "reservation-1",
      errors: [],
    }, "journey-1", false, {
      status: attemptStatus,
      reservationPaymentStatus: "PENDING",
      balanceOutstanding: 100,
    });

    expect(viewModel.status).toBe(expectedStatus);
    expect(viewModel.paymentAttemptStatus).toBe(attemptStatus);
  });
});