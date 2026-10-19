import { Journey, JourneyAccommodation, selectJourneyAccommodation } from "../../../journeys";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore, journeySelectionStore } from "./journey-selection-store";
import { assertJourneyStateOwner } from "./journey-state-ownership";

export type AccommodationSelectionStatus = "COMPLETE" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE" | "INCOMPLETE" | "STALE";

export interface AccommodationSelectionInput {
  readonly stopId?: string;
  readonly accommodationId: string;
  readonly roomReference?: { readonly provider: string; readonly opaqueReference: string };
  readonly rateReference?: { readonly provider: string; readonly opaqueReference: string };
  readonly roomSelections?: ReadonlyArray<{
    readonly roomReference: { readonly provider: string; readonly opaqueReference: string };
    readonly rateReference: { readonly provider: string; readonly opaqueReference: string };
  }>;
}

export interface AccommodationSelectionResult {
  readonly status: AccommodationSelectionStatus;
  readonly journeyId: string;
  readonly selectedStops: ReadonlyArray<{ readonly stopId?: string; readonly accommodationId: string; readonly roomReference: string; readonly rateReference: string }>;
}

export interface AccommodationSelectionService {
  selectAccommodation(ownerId: string, journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<AccommodationSelectionResult>;
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

function stopKeys(journey: Journey): ReadonlySet<string> {
  return new Set(journey.accommodation.map((option, index) =>
    option.packageStop?.stopId ?? `legacy-stop-${index + 1}`,
  ));
}

export class DefaultAccommodationSelectionService implements AccommodationSelectionService {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver,
    private readonly selectionStore: JourneySelectionStore = journeySelectionStore,
  ) {}

  public async selectAccommodation(
    ownerId: string,
    journeyId: string,
    selections: ReadonlyArray<AccommodationSelectionInput>,
  ): Promise<AccommodationSelectionResult> {
    assertJourneyStateOwner(ownerId);
    const resolution = await this.resolver.resolve(ownerId, journeyId);
    if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND" || resolution.status === "UNAVAILABLE") {
      return { status: resolution.status, journeyId, selectedStops: [] };
    }

    if (!Array.isArray(selections) || selections.length !== stopKeys(resolution.journey!).size) {
      return { status: "INCOMPLETE", journeyId, selectedStops: [] };
    }

    const selectedStops: Array<{ stopId?: string; accommodationId: string; roomReference: string; rateReference: string }> = [];
    const selectedStopIds = new Set<string>();
    for (const input of selections) {
      const roomSelections: NonNullable<AccommodationSelectionInput["roomSelections"]> = input.roomSelections ?? (input.roomReference && input.rateReference
        ? [{ roomReference: input.roomReference, rateReference: input.rateReference }]
        : []);
      const firstRoomSelection = roomSelections[0];
      if (!firstRoomSelection || !roomSelections.every((roomSelection) =>
          isValidReference(roomSelection.roomReference) && isValidReference(roomSelection.rateReference),
        )) {
        return { status: "INVALID", journeyId, selectedStops: [] };
      }
      const option = findOption(resolution.journey!, input);
      if (!option) {
        return { status: "INVALID", journeyId, selectedStops: [] };
      }
      const stopId = option.packageStop?.stopId ?? input.stopId ?? option.accommodationId;
      if (selectedStopIds.has(stopId)) {
        return { status: "INVALID", journeyId, selectedStops: [] };
      }
      selectedStopIds.add(stopId);
      try {
        const selected = selectJourneyAccommodation(option, {
          accommodationId: input.accommodationId,
          packageStopId: input.stopId,
          roomReference: firstRoomSelection.roomReference,
          rateReference: firstRoomSelection.rateReference,
          roomSelections,
        });
        const requestedOccupancy = option.requestedOccupancy?.rooms;
        if (requestedOccupancy && requestedOccupancy.length !== roomSelections.length) {
          return { status: "INVALID", journeyId, selectedStops: [] };
        }
        if (requestedOccupancy?.some((occupancy, index) => {
          const selectedRate = selected.pricingInput?.roomRates?.[index]?.rate;
          return !selectedRate || selectedRate.occupancy.rooms.length !== 1
            || selectedRate.occupancy.rooms[0]?.adults !== occupancy.adults
            || selectedRate.occupancy.rooms[0]?.children !== 0;
        })) {
          return { status: "STALE", journeyId, selectedStops: [] };
        }
        selectedStops.push({
          stopId: selected.packageStop?.stopId ?? input.stopId,
          accommodationId: selected.accommodationId,
          roomReference: firstRoomSelection.roomReference.opaqueReference,
          rateReference: firstRoomSelection.rateReference.opaqueReference,
        });
      } catch {
        return { status: "STALE", journeyId, selectedStops: [] };
      }
    }

    this.selectionStore.save(ownerId, journeyId, selections);
    return { status: "COMPLETE", journeyId, selectedStops };
  }
}