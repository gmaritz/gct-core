import { GuestInformationViewModelProvider } from "./guest-information.viewmodel-provider";

describe("GuestInformationViewModelProvider", () => {
  it("maps submitted values, errors and reservation-review continuation", (): void => {
    const viewModel = new GuestInformationViewModelProvider().provide({
      status: "INVALID",
      journeyId: "journey-homepage-journey-001",
      errors: ["A valid contact email is required."],
      information: {
        contact: { email: "bad-email", phone: "+27112223333" },
        leadTravellerIndex: 0,
        travellers: [{ firstName: "Ava", lastName: "Cape", email: "ava@example.com", travellerType: "ADULT" }],
      },
    });

    expect(viewModel.contact.email).toBe("bad-email");
    expect(viewModel.travellers[0]?.firstName).toBe("Ava");
    expect(viewModel.errors).toEqual(["A valid contact email is required."]);
    expect(viewModel.complete).toBe(false);
    expect(viewModel.continuation).toBeUndefined();
  });
});
