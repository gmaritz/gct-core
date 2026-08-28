import { CTAViewModel } from "../shared/cta.viewmodel";

export interface BookingConfirmationViewModel {
  readonly status: "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";
  readonly reservationReference?: string;
  readonly journeyTitle?: string;
  readonly destination?: string;
  readonly duration?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly accommodation: ReadonlyArray<{ readonly property: string; readonly room?: string; readonly destination?: string }>;
  readonly leadTraveller?: string;
  readonly travellers: ReadonlyArray<{ readonly name: string; readonly travellerType?: string }>;
  readonly contactEmail?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentStatus?: string;
  readonly reservationStatus?: string;
  readonly fulfilmentStatus?: string;
  readonly message: string;
  readonly recoveryAction: CTAViewModel;
}