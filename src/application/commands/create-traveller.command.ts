/**
 * Create Traveller Command
 * 
 * Command to initiate the creation of a new traveller.
 */
export class CreateTravellerCommand {
  constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string
  ) {}
}
