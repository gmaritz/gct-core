import { GuestInformationInput } from "./guest-information-service";
import { GuestInformationStore } from "./guest-information-store";

const journeyId = "journey-homepage-journey-001";

const guestA: GuestInformationInput = {
  contact: { email: "a@example.test" },
  leadTravellerIndex: 0,
  travellers: [
    { firstName: "Ava", lastName: "Example", email: "a@example.test", travellerType: "ADULT" },
    { firstName: "Alex", lastName: "Example", email: "a2@example.test", travellerType: "ADULT" },
  ],
};

const guestB: GuestInformationInput = {
  contact: { email: "b@example.test" },
  leadTravellerIndex: 0,
  travellers: [
    { firstName: "Bea", lastName: "Example", email: "b@example.test", travellerType: "ADULT" },
    { firstName: "Blake", lastName: "Example", email: "b2@example.test", travellerType: "ADULT" },
  ],
};

describe("GuestInformationStore owner isolation", () => {
  it("isolates saves, reads, updates, and clears for owners sharing a public journey ID", () => {
    const store = new GuestInformationStore();
    store.save("owner-a", journeyId, guestA);
    expect(store.find("owner-b", journeyId)).toBeUndefined();

    store.save("owner-b", journeyId, guestB);
    expect(store.find("owner-a", journeyId)?.contact.email).toBe("a@example.test");
    expect(store.find("owner-b", journeyId)?.contact.email).toBe("b@example.test");

    store.save("owner-b", journeyId, { ...guestB, contact: { email: "updated-b@example.test" } });
    store.clear("owner-b", journeyId);
    expect(store.find("owner-b", journeyId)).toBeUndefined();
    expect(store.find("owner-a", journeyId)).toEqual(guestA);
  });

  it("fails closed when the owner context is missing", () => {
    const store = new GuestInformationStore();

    expect(() => Reflect.apply(store.find, store, [undefined, journeyId])).toThrow("validated journey-state owner");
    expect(() => Reflect.apply(store.save, store, [undefined, journeyId, guestA])).toThrow("validated journey-state owner");
    expect(() => Reflect.apply(store.clear, store, [undefined, journeyId])).toThrow("validated journey-state owner");
  });
});
