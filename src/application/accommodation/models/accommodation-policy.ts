export interface AccommodationPolicy {
  readonly type: "Check-in" | "Check-out" | "Child Policy" | "Cancellation Policy" | "Pet Policy";
  readonly description: string;
}
