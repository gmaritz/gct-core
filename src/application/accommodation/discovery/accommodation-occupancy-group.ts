export interface AccommodationOccupancyGroup {
  readonly slotId?: string;
  readonly rooms?: number;
  readonly adults: number;
  readonly children: number;
  readonly childAges: ReadonlyArray<number>;
}
