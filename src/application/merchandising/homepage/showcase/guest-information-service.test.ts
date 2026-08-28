import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultGuestInformationService, GuestInformationInput } from "./guest-information-service";

function createResolver(): DynamicHomepageJourneyResolver {
  const journey = Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "HOMEPAGE" },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [{
      accommodationId: "property-1",
      name: "Cape Winelands Retreat",
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
    }],
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
  return { resolve: async (): Promise<{ status: "RESOLVED"; journey: Journey }> => ({ status: "RESOLVED", journey }) };
}

const validInformation: GuestInformationInput = {
  contact: { email: "contact@example.com", phone: "+27112223333" },
  leadTravellerIndex: 0,
  travellers: [
    { firstName: "Ava", lastName: "Cape", email: "ava@example.com", travellerType: "ADULT" },
    { firstName: "Ben", lastName: "Cape", email: "ben@example.com", travellerType: "ADULT" },
  ],
};

describe("DefaultGuestInformationService", () => {
  it("validates contact, lead and multiple travellers against occupancy", async (): Promise<void> => {
    const result = await new DefaultGuestInformationService(createResolver()).captureGuestInformation(
      "journey-homepage-journey-001",
      validInformation,
    );

    expect(result.status).toBe("VALID");
    expect(result.information?.travellers).toHaveLength(2);
    expect(result.information?.contact.email).toBe("contact@example.com");
  });

  it("rejects invalid traveller count and required fields while preserving input", async (): Promise<void> => {
    const information = {
      ...validInformation,
      contact: { email: "bad-email" },
      travellers: [{ ...validInformation.travellers[0], firstName: "" }],
    };
    const result = await new DefaultGuestInformationService(createResolver()).captureGuestInformation(
      "journey-homepage-journey-001",
      information,
    );

    expect(result.status).toBe("INVALID");
    expect(result.information).toBe(information);
    expect(result.errors).toEqual(expect.arrayContaining([
      "A valid contact email is required.",
      "Exactly 2 traveller details are required.",
      "Traveller 1 first name is required.",
    ]));
  });

  it("returns the resolver outcome for an invalid journey", async (): Promise<void> => {
    const result = await new DefaultGuestInformationService({
      resolve: async () => ({ status: "INVALID" }),
    }).captureGuestInformation("invalid", validInformation);

    expect(result.status).toBe("INVALID");
    expect(result.errors).toEqual([]);
  });
});
