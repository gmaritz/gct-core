import { ApplicationService } from "../../../application-service";
import { Accommodation } from "../../models";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { ProviderRegistry } from "../../registry";
import { AccommodationAvailabilityResult, AccommodationResultMetadata } from "../../results";

import { AccommodationInventoryQuery, AccommodationInventoryRequest } from "../models";
import { AccommodationInventoryValidator } from "../validation";

interface AccommodationInventoryProvider {
  availability(request: AccommodationInventoryRequest): Promise<AccommodationAvailabilityResult>;
}

function hasAvailabilityMethod(provider: unknown): provider is AccommodationInventoryProvider {
  return typeof (provider as AccommodationInventoryProvider | undefined)?.availability === "function";
}

function createRequest(query: AccommodationInventoryQuery): AccommodationInventoryRequest {
  return Object.freeze({
    identifier: query.identifier,
    checkInDate: query.checkInDate,
    checkOutDate: query.checkOutDate,
    adults: query.adults,
    children: query.children,
    rooms: query.rooms,
    context: query.context,
  });
}

function cloneAccommodation(accommodation: Accommodation): Accommodation {
  return Object.freeze({
    identity: Object.freeze({ ...accommodation.identity }),
    category: accommodation.category,
    location: Object.freeze({ ...accommodation.location }),
    rating: Object.freeze({ ...accommodation.rating }),
    images: Object.freeze(accommodation.images.map((image) => Object.freeze({ ...image }))),
    amenities: Object.freeze([...accommodation.amenities]),
    policies: Object.freeze(accommodation.policies.map((policy) => Object.freeze({ ...policy }))),
    contacts: Object.freeze(accommodation.contacts.map((contact) => Object.freeze({ ...contact }))),
    providerReference: Object.freeze({ ...accommodation.providerReference }),
  });
}

function cloneMetadata(metadata: AccommodationResultMetadata): AccommodationResultMetadata {
  return Object.freeze({
    provider: metadata.provider,
    generatedAt: new Date(metadata.generatedAt),
    version: metadata.version,
  });
}

function cloneAvailabilityOptions(
  options: NonNullable<Extract<AccommodationAvailabilityResult, { readonly kind: "ACCOMMODATION" }>["availabilityOptions"]>,
): NonNullable<Extract<AccommodationAvailabilityResult, { readonly kind: "ACCOMMODATION" }>["availabilityOptions"]> {
  return Object.freeze({
    roomOptions: Object.freeze(options.roomOptions.map((room) => Object.freeze({
      reference: Object.freeze({ ...room.reference }),
      name: room.name,
      rateOptions: Object.freeze(room.rateOptions.map((rate) => Object.freeze({
        reference: Object.freeze({ ...rate.reference }),
        status: rate.status,
        pricing: Object.freeze({ ...rate.pricing }),
        occupancy: Object.freeze({
          rooms: Object.freeze(rate.occupancy.rooms.map((occupancy) => Object.freeze({
            adults: occupancy.adults,
            children: occupancy.children,
            childAges: Object.freeze([...occupancy.childAges]),
          }))),
        }),
        board: rate.board ? Object.freeze({ ...rate.board }) : undefined,
        allotment: rate.allotment,
        payment: rate.payment ? Object.freeze({ ...rate.payment }) : undefined,
        packaging: rate.packaging,
        cancellationPolicies: Object.freeze(rate.cancellationPolicies.map((policy) => Object.freeze({ ...policy }))),
        taxes: Object.freeze(rate.taxes.map((tax) => Object.freeze({ ...tax }))),
      }))),
    }))),
  });
}

function freezeAvailabilityResult(result: AccommodationAvailabilityResult): AccommodationAvailabilityResult {
  if (result.kind === "NO_AVAILABILITY") {
    return Object.freeze({
      kind: "NO_AVAILABILITY",
      available: false,
      metadata: cloneMetadata(result.metadata),
    });
  }

  return Object.freeze({
    kind: "ACCOMMODATION",
    accommodation: cloneAccommodation(result.accommodation),
    available: result.available,
    requestedOccupancy: result.requestedOccupancy
      ? Object.freeze({
          rooms: Object.freeze(result.requestedOccupancy.rooms.map((room) => Object.freeze({
            adults: room.adults,
            children: room.children,
            childAges: Object.freeze([...room.childAges]),
          }))),
        })
      : undefined,
    availabilityOptions: result.availabilityOptions
      ? cloneAvailabilityOptions(result.availabilityOptions)
      : undefined,
    metadata: cloneMetadata(result.metadata),
  });
}

export class AccommodationInventoryService
  implements ApplicationService<AccommodationInventoryQuery, AccommodationAvailabilityResult>
{
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly validator: AccommodationInventoryValidator = new AccommodationInventoryValidator(),
  ) {}

  public async execute(query: AccommodationInventoryQuery): Promise<AccommodationAvailabilityResult> {
    const request = createRequest(query);
    const validationResult = this.validator.validate(request);

    if (!validationResult.valid) {
      throw new Error(
        `Accommodation inventory validation failed: ${validationResult.errors
          .map((error) => error.code)
          .join(", ")}`,
      );
    }

    const providers = this.providerRegistry.findProviders(AccommodationProviderCapabilityType.AVAILABILITY);
    const providerResults = await Promise.allSettled(
      providers.map(async (provider) => {
        if (!hasAvailabilityMethod(provider)) {
          throw new Error(`Provider does not implement inventory retrieval: ${provider.providerId}`);
        }

        return provider.availability(request);
      }),
    );

    const successfulResults = providerResults
      .filter((providerResult): providerResult is PromiseFulfilledResult<AccommodationAvailabilityResult> =>
        providerResult.status === "fulfilled",
      )
      .map((providerResult) => providerResult.value);

    if (successfulResults.length === 0) {
      throw new Error("No accommodation inventory providers returned availability");
    }

    return freezeAvailabilityResult(successfulResults[0]!);
  }
}