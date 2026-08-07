import { ReservationSnapshot } from "./reservation-snapshot";

export interface TravellerSnapshot extends ReservationSnapshot {
  readonly travellerId: string;
  readonly fullName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly nationality?: string;
  readonly travellerType?: string;
  readonly dateOfBirth?: Date;
}
