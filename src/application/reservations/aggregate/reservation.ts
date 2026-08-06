export enum ReservationStatus {
  CREATED = "CREATED",
  QUOTED = "QUOTED",
  CONFIRMED = "CONFIRMED",
  AMENDED = "AMENDED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface ReservationIdentity {
  readonly id: string;
}

export interface JourneySnapshot {
  readonly journeyId: string;
  readonly title: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly summary?: string;
}

export interface TravellerSnapshot {
  readonly travellerId: string;
  readonly fullName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
}

export interface AccommodationSnapshot {
  readonly accommodationId: string;
  readonly name: string;
  readonly checkInDate?: Date;
  readonly checkOutDate?: Date;
  readonly roomType?: string;
}

export interface PricingSnapshot {
  readonly currency: string;
  readonly subtotal: number;
  readonly taxes: number;
  readonly total: number;
}

export interface PaymentSnapshot {
  readonly status: string;
  readonly method?: string;
  readonly paidAmount?: number;
  readonly currency?: string;
  readonly transactionReference?: string;
}

export interface SupplierReference {
  readonly supplier: string;
  readonly reference: string;
}

export interface ReservationTimelineEntry {
  readonly type: string;
  readonly occurredAt: Date;
  readonly note?: string;
}

export interface ReservationMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
}

export interface ReservationComposition {
  readonly identity: ReservationIdentity;
  readonly status: ReservationStatus;
  readonly journeySnapshot: JourneySnapshot;
  readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
  readonly accommodationSnapshots?: ReadonlyArray<AccommodationSnapshot>;
  readonly pricingSnapshot?: PricingSnapshot;
  readonly paymentSnapshot?: PaymentSnapshot;
  readonly supplierReferences?: ReadonlyArray<SupplierReference>;
  readonly timeline?: ReadonlyArray<ReservationTimelineEntry>;
  readonly metadata: ReservationMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeIdentity(identity: ReservationIdentity): ReservationIdentity {
  return Object.freeze({ ...identity });
}

function freezeJourneySnapshot(snapshot: JourneySnapshot): JourneySnapshot {
  return Object.freeze({
    journeyId: snapshot.journeyId,
    title: snapshot.title,
    startDate: typeof snapshot.startDate === "undefined" ? undefined : cloneDate(snapshot.startDate),
    endDate: typeof snapshot.endDate === "undefined" ? undefined : cloneDate(snapshot.endDate),
    summary: snapshot.summary,
  });
}

function freezeTravellerSnapshot(snapshot: TravellerSnapshot): TravellerSnapshot {
  return Object.freeze({
    travellerId: snapshot.travellerId,
    fullName: snapshot.fullName,
    email: snapshot.email,
    phone: snapshot.phone,
    dateOfBirth: typeof snapshot.dateOfBirth === "undefined" ? undefined : cloneDate(snapshot.dateOfBirth),
  });
}

function freezeAccommodationSnapshot(snapshot: AccommodationSnapshot): AccommodationSnapshot {
  return Object.freeze({
    accommodationId: snapshot.accommodationId,
    name: snapshot.name,
    checkInDate: typeof snapshot.checkInDate === "undefined" ? undefined : cloneDate(snapshot.checkInDate),
    checkOutDate: typeof snapshot.checkOutDate === "undefined" ? undefined : cloneDate(snapshot.checkOutDate),
    roomType: snapshot.roomType,
  });
}

function freezePricingSnapshot(snapshot: PricingSnapshot): PricingSnapshot {
  return Object.freeze({ ...snapshot });
}

function freezePaymentSnapshot(snapshot: PaymentSnapshot): PaymentSnapshot {
  return Object.freeze({ ...snapshot });
}

function freezeSupplierReference(reference: SupplierReference): SupplierReference {
  return Object.freeze({ ...reference });
}

function freezeTimelineEntry(entry: ReservationTimelineEntry): ReservationTimelineEntry {
  return Object.freeze({
    type: entry.type,
    occurredAt: cloneDate(entry.occurredAt),
    note: entry.note,
  });
}

function freezeMetadata(metadata: ReservationMetadata): ReservationMetadata {
  return Object.freeze({
    createdAt: cloneDate(metadata.createdAt),
    updatedAt: cloneDate(metadata.updatedAt),
    version: metadata.version,
  });
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function ensureInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateRequiredComposition(composition: ReservationComposition): void {
  ensureInvariant(!isBlank(composition.identity?.id), "Reservation identity is required.");
  ensureInvariant(typeof composition.status === "string", "Reservation status is required.");
  ensureInvariant(!isBlank(composition.journeySnapshot?.journeyId), "Journey snapshot is required.");
  ensureInvariant(
    Array.isArray(composition.travellerSnapshots) && composition.travellerSnapshots.length > 0,
    "At least one traveller snapshot is required.",
  );
  ensureInvariant(composition.travellerSnapshots.every((snapshot) => !isBlank(snapshot?.travellerId)), "Traveller snapshots are invalid.");
  ensureInvariant(
    typeof composition.metadata === "object" && composition.metadata !== null,
    "Reservation metadata is required.",
  );
  ensureInvariant(!isBlank(composition.metadata.version), "Reservation metadata version is required.");
}

export class Reservation {
  public readonly identity: ReservationIdentity;
  public readonly status: ReservationStatus;
  public readonly journeySnapshot: JourneySnapshot;
  public readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
  public readonly accommodationSnapshots: ReadonlyArray<AccommodationSnapshot>;
  public readonly pricingSnapshot?: PricingSnapshot;
  public readonly paymentSnapshot?: PaymentSnapshot;
  public readonly supplierReferences: ReadonlyArray<SupplierReference>;
  public readonly timeline: ReadonlyArray<ReservationTimelineEntry>;
  public readonly metadata: ReservationMetadata;

  private constructor(composition: ReservationComposition) {
    validateRequiredComposition(composition);

    this.identity = freezeIdentity(composition.identity);
    this.status = composition.status;
    this.journeySnapshot = freezeJourneySnapshot(composition.journeySnapshot);
    this.travellerSnapshots = Object.freeze(composition.travellerSnapshots.map(freezeTravellerSnapshot));
    this.accommodationSnapshots = Object.freeze((composition.accommodationSnapshots ?? []).map(freezeAccommodationSnapshot));
    this.pricingSnapshot =
      typeof composition.pricingSnapshot === "undefined"
        ? undefined
        : freezePricingSnapshot(composition.pricingSnapshot);
    this.paymentSnapshot =
      typeof composition.paymentSnapshot === "undefined"
        ? undefined
        : freezePaymentSnapshot(composition.paymentSnapshot);
    this.supplierReferences = Object.freeze((composition.supplierReferences ?? []).map(freezeSupplierReference));
    this.timeline = Object.freeze((composition.timeline ?? []).map(freezeTimelineEntry));
    this.metadata = freezeMetadata(composition.metadata);

    Object.freeze(this);
  }

  public static create(composition: ReservationComposition): Reservation {
    return new Reservation(composition);
  }

  public static restore(composition: ReservationComposition): Reservation {
    return new Reservation(composition);
  }
}
