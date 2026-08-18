export interface AccommodationOccupancyGroup {
  readonly rooms?: number;
  readonly adults: number;
  readonly children: number;
  readonly childAges: ReadonlyArray<number>;
}
