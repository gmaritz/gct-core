/**
 * Create Traveller Command
 * 
 * Command to initiate the creation of a new traveller.
 */
export class CreateTravellerCommand {
  constructor(
    readonly customerId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string
  ) {}
}
