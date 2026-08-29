-- IMP-011: a canonical Reservation may be established before its originating Booking.
ALTER TABLE "reservation"
  ALTER COLUMN "bookingId" DROP NOT NULL;