/**
 * Update Traveller Command
 * 
 * Command to update an existing traveller's profile.
 */
export class UpdateTravellerCommand {
  constructor(
    readonly travelerId: string,
    readonly firstName: string,
    readonly lastName: string
  ) {}
}
