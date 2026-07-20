/**
 * Create Journey Command
 * 
 * Command to create a new journey.
 */
export class CreateJourneyCommand {
  constructor(
    readonly travelerId: string,
    readonly name: string,
    readonly description: string,
    readonly startDate: Date,
    readonly endDate: Date
  ) {}
}
