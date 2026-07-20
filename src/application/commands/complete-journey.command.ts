/**
 * Complete Journey Command
 * 
 * Command to mark an ongoing journey as completed.
 */
export class CompleteJourneyCommand {
  constructor(readonly journeyId: string) {}
}
