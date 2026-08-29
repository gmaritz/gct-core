import { Journey, JourneyAccommodation, selectJourneyAccommodation } from "../../../journeys";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore, journeySelectionStore } from "./journey-selection-store";

export type AccommodationSelectionStatus = "COMPLETE" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE" | "INCOMPLETE" | "STALE";

export interface AccommodationSelectionInput {
  readonly stopId?: string;
  readonly accommodationId: string;
  readonly roomReference: { readonly provider: string; readonly opaqueReference: string };
  readonly rateReference: { readonly provider: string; readonly opaqueReference: string };
}

export interface AccommodationSelectionResult {
  readonly status: AccommodationSelectionStatus;
  readonly journeyId: string;
  readonly selectedStops: ReadonlyArray<{ readonly stopId?: string; readonly accommodationId: string; readonly roomReference: string; readonly rateReference: string }>;
}

export interface AccommodationSelectionService {
  selectAccommodation(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<AccommodationSelectionResult>;
}

function isValidReference(reference: unknown): reference is { readonly provider: string; readonly opaqueReference: string } {
  return typeof reference === "object" && reference !== null
    && typeof (reference as { provider?: unknown }).provider === "string"
    && typeof (reference as { opaqueReference?: unknown }).opaqueReference === "string";
}

function findOption(journey: Journey, input: AccommodationSelectionInput): JourneyAccommodation | undefined {
  return journey.accommodation.find((option) =>
    option.accommodationId === input.accommodationId
    && (!input.stopId || option.packageStop?.stopId === input.stopId),
  );
}

export class DefaultAccommodationSelectionService implements AccommodationSelectionService {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver,
    private readonly selectionStore: JourneySelectionStore = journeySelectionStore,
  ) {}

  public async selectAccommodation(
    journeyId: string,
    selections: ReadonlyArray<AccommodationSelectionInput>,
  ): Promise<AccommodationSelectionResult> {
    const resolution = await this.resolver.resolve(journeyId);
    if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND" || resolution.status === "UNAVAILABLE") {
      return { status: resolution.status, journeyId, selectedStops: [] };
    }

    if (!Array.isArray(selections) || selections.length !== resolution.journey?.accommodation.length) {
      return { status: "INCOMPLETE", journeyId, selectedStops: [] };
    }

    const selectedStops: Array<{ stopId?: string; accommodationId: string; roomReference: string; rateReference: string }> = [];
    for (const input of selections) {
      if (!isValidReference(input.roomReference) || !isValidReference(input.rateReference)) {
        return { status: "INVALID", journeyId, selectedStops: [] };
      }
      const option = findOption(resolution.journey!, input);
      if (!option) {
        return { status: "INVALID", journeyId, selectedStops: [] };
      }
      try {
        const selected = selectJourneyAccommodation(option, {
          accommodationId: input.accommodationId,
          packageStopId: input.stopId,
          roomReference: input.roomReference,
          rateReference: input.rateReference,
        });
        selectedStops.push({
          stopId: selected.packageStop?.stopId,
          accommodationId: selected.accommodationId,
          roomReference: input.roomReference.opaqueReference,
          rateReference: input.rateReference.opaqueReference,
        });
      } catch {
        return { status: "STALE", journeyId, selectedStops: [] };
      }
    }

    this.selectionStore.save(journeyId, selections);
    return { status: "COMPLETE", journeyId, selectedStops };
  }
}