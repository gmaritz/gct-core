import {
  AccommodationSnapshot,
  BookingItemSnapshot,
  JourneySnapshot,
  PaymentSnapshot,
  PricingSnapshot,
  ReservationMetadata,
  ReservationTimeline,
  ReservationTimelineEntry,
  SupplierReference,
  TravellerSnapshot,
} from "../models";

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

export interface ReservationComposition {
  readonly identity: ReservationIdentity;
  readonly reservationNumber: string;
  readonly status: ReservationStatus;
  readonly journeySnapshot: JourneySnapshot;
  readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
  readonly accommodationSnapshots?: ReadonlyArray<AccommodationSnapshot>;
  readonly bookingItems?: ReadonlyArray<BookingItemSnapshot>;
  readonly pricingSnapshot?: PricingSnapshot;
  readonly paymentSnapshot?: PaymentSnapshot;
  readonly supplierReferences?: ReadonlyArray<SupplierReference>;
  readonly timeline?: ReservationTimeline;
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
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    journeyId: snapshot.journeyId,
    title: snapshot.title,
    destination: snapshot.destination,
    duration: snapshot.duration,
    accommodationSummary: snapshot.accommodationSummary,
    experienceSummary: snapshot.experienceSummary,
    startDate: typeof snapshot.startDate === "undefined" ? undefined : cloneDate(snapshot.startDate),
    endDate: typeof snapshot.endDate === "undefined" ? undefined : cloneDate(snapshot.endDate),
    summary: snapshot.summary,
  });
}

function freezeTravellerSnapshot(snapshot: TravellerSnapshot): TravellerSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    travellerId: snapshot.travellerId,
    fullName: snapshot.fullName,
    email: snapshot.email,
    phone: snapshot.phone,
    nationality: snapshot.nationality,
    travellerType: snapshot.travellerType,
    dateOfBirth: typeof snapshot.dateOfBirth === "undefined" ? undefined : cloneDate(snapshot.dateOfBirth),
  });
}

function freezeAccommodationSnapshot(snapshot: AccommodationSnapshot): AccommodationSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    accommodationId: snapshot.accommodationId,
    propertyName: snapshot.propertyName,
    roomType: snapshot.roomType,
    mealBasis: snapshot.mealBasis,
    checkInDate: typeof snapshot.checkInDate === "undefined" ? undefined : cloneDate(snapshot.checkInDate),
    checkOutDate: typeof snapshot.checkOutDate === "undefined" ? undefined : cloneDate(snapshot.checkOutDate),
    packageId: snapshot.packageId,
    packageStopId: snapshot.packageStopId,
    stopOrder: snapshot.stopOrder,
    rateReference: snapshot.rateReference ? Object.freeze({ ...snapshot.rateReference }) : undefined,
    roomReference: snapshot.roomReference ? Object.freeze({ ...snapshot.roomReference }) : undefined,
    provider: snapshot.provider,
    occupancy: snapshot.occupancy
      ? Object.freeze({
          rooms: Object.freeze(snapshot.occupancy.rooms.map((room) => Object.freeze({
            adults: room.adults,
            children: room.children,
            childAges: Object.freeze([...room.childAges]),
          }))),
        })
      : undefined,
    supplierPrice: snapshot.supplierPrice ? Object.freeze({ ...snapshot.supplierPrice }) : undefined,
  });
}

function freezeSupplierReference(reference: SupplierReference): SupplierReference {
  return Object.freeze({
    snapshotId: reference.snapshotId,
    capturedAt: cloneDate(reference.capturedAt),
    version: reference.version,
    providerId: reference.providerId,
    supplierBookingReference: reference.supplierBookingReference,
    confirmationNumber: reference.confirmationNumber,
    bookingId: reference.bookingId,
    bookingItemId: reference.bookingItemId,
    supplierId: reference.supplierId,
    reservationReference: reference.reservationReference,
    reservationStatusId: reference.reservationStatusId,
    reservedAt: reference.reservedAt ? cloneDate(reference.reservedAt) : undefined,
    confirmedAt: reference.confirmedAt ? cloneDate(reference.confirmedAt) : undefined,
    cancelledAt: reference.cancelledAt ? cloneDate(reference.cancelledAt) : undefined,
  });
}

function freezeTimelineEntry(entry: ReservationTimelineEntry): ReservationTimelineEntry {
  return Object.freeze({
    snapshotId: entry.snapshotId,
    capturedAt: cloneDate(entry.capturedAt),
    version: entry.version,
    milestone: entry.milestone,
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

function freezePricingSnapshot(snapshot: PricingSnapshot): PricingSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    currency: snapshot.currency,
    totalPrice: snapshot.totalPrice,
    taxes: snapshot.taxes,
    discounts: snapshot.discounts,
    fees: snapshot.fees,
  });
}

function freezePaymentSnapshot(snapshot: PaymentSnapshot): PaymentSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    paymentStatus: snapshot.paymentStatus,
    paymentMethod: snapshot.paymentMethod,
    amountReceived: snapshot.amountReceived,
    balanceOutstanding: snapshot.balanceOutstanding,
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
  ensureInvariant(!isBlank(composition.reservationNumber), "Reservation number is required.");
  ensureInvariant(typeof composition.status === "string", "Reservation status is required.");
  ensureInvariant(!isBlank(composition.journeySnapshot?.journeyId), "Journey snapshot is required.");
  ensureInvariant(!isBlank(composition.journeySnapshot?.snapshotId), "Journey snapshot is required.");
  ensureInvariant(
    Array.isArray(composition.travellerSnapshots) && composition.travellerSnapshots.length > 0,
    "At least one traveller snapshot is required.",
  );
  ensureInvariant(
    composition.travellerSnapshots.every((snapshot) => !isBlank(snapshot?.travellerId) && !isBlank(snapshot?.snapshotId)),
    "Traveller snapshots are invalid.",
  );
  ensureInvariant(
    typeof composition.metadata === "object" && composition.metadata !== null,
    "Reservation metadata is required.",
  );
  ensureInvariant(!isBlank(composition.metadata.version), "Reservation metadata version is required.");
}

export class Reservation {
  public readonly identity: ReservationIdentity;
  public readonly reservationNumber: string;
  public readonly status: ReservationStatus;
  public readonly journeySnapshot: JourneySnapshot;
  public readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
  public readonly accommodationSnapshots: ReadonlyArray<AccommodationSnapshot>;
  public readonly bookingItems: ReadonlyArray<BookingItemSnapshot>;
  public readonly pricingSnapshot?: PricingSnapshot;
  public readonly paymentSnapshot?: PaymentSnapshot;
  public readonly supplierReferences: ReadonlyArray<SupplierReference>;
  public readonly timeline: ReservationTimeline;
  public readonly metadata: ReservationMetadata;

  private constructor(composition: ReservationComposition) {
    validateRequiredComposition(composition);

    this.identity = freezeIdentity(composition.identity);
    this.reservationNumber = composition.reservationNumber;
    this.status = composition.status;
    this.journeySnapshot = freezeJourneySnapshot(composition.journeySnapshot);
    this.travellerSnapshots = Object.freeze(composition.travellerSnapshots.map(freezeTravellerSnapshot));
    this.accommodationSnapshots = Object.freeze((composition.accommodationSnapshots ?? []).map(freezeAccommodationSnapshot));
    this.bookingItems = Object.freeze((composition.bookingItems ?? []).map((item) => Object.freeze({
      ...item,
      capturedAt: cloneDate(item.capturedAt),
      supplierBookings: Object.freeze((item.supplierBookings ?? []).map((supplier) => Object.freeze({
        ...supplier,
        capturedAt: cloneDate(supplier.capturedAt),
        requestedAt: supplier.requestedAt ? cloneDate(supplier.requestedAt) : undefined,
        confirmedAt: supplier.confirmedAt ? cloneDate(supplier.confirmedAt) : undefined,
        cancelledAt: supplier.cancelledAt ? cloneDate(supplier.cancelledAt) : undefined,
      }))),
    })));
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
