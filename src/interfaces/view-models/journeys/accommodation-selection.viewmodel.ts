import { CTAViewModel } from "../shared/cta.viewmodel";

export type AccommodationStopSelectionState = "NOT_SELECTED" | "PROPERTY_SELECTED" | "ROOM_SELECTED" | "COMPLETE";

export interface AccommodationRateOptionViewModel {
  readonly id: string;
  readonly name?: string;
  readonly status: string;
  readonly amount: number;
  readonly currency: string;
}

export interface AccommodationRoomOptionViewModel {
  readonly id: string;
  readonly name: string;
  readonly rates: ReadonlyArray<AccommodationRateOptionViewModel>;
}

export interface AccommodationPropertyOptionViewModel {
  readonly id: string;
  readonly name: string;
  readonly destination: string;
  readonly category?: string;
  readonly rating?: number;
  readonly rooms: ReadonlyArray<AccommodationRoomOptionViewModel>;
}

export interface AccommodationSelectionStopViewModel {
  readonly id?: string;
  readonly order: number;
  readonly destination: string;
  readonly checkIn?: string;
  readonly checkOut?: string;
  readonly nights?: number;
  readonly occupancy?: ReadonlyArray<{ readonly adults: number; readonly children: number; readonly childAges: ReadonlyArray<number> }>;
  readonly properties: ReadonlyArray<AccommodationPropertyOptionViewModel>;
  readonly state: AccommodationStopSelectionState;
}

export interface AccommodationSelectionViewModel {
  readonly journeyId: string;
  readonly journeyTitle: string;
  readonly stops: ReadonlyArray<AccommodationSelectionStopViewModel>;
  readonly complete: boolean;
  readonly status?: string;
  readonly continuation?: CTAViewModel;
}