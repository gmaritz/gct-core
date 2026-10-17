import path from "path";
import ejs from "ejs";
import { JourneyQuoteViewModelProvider } from "../../view-models/providers/journey-quote.viewmodel-provider";

const template = path.join(__dirname, "journey-quote.ejs");

describe("INT-004.2 journey quote page with unconfirmed accommodation currency", () => {
  it("renders the ZAR group component and explanation without a combined total or continue link", async () => {
    const quoteViewModel = new JourneyQuoteViewModelProvider().provide({
      status: "CURRENCY_UNCONFIRMED",
      journeyId: "journey-homepage-journey-001",
      selections: [],
      groupComponent: { amount: 51376, currency: "ZAR" },
    });

    const html = await ejs.renderFile(template, { quoteViewModel });

    expect(html).toContain("Go Cape Tours journey component");
    expect(html).toMatch(/ZAR 51\D?376/);
    expect(html).toContain("currency requires confirmation");
    expect(html).toContain("Pending currency confirmation");
    expect(html).not.toContain("Total Payable Quote");
    expect(html).not.toContain("Total accommodation");
    expect(html).not.toContain("/guest-information");
    expect(html).toContain("Review accommodation");
  });
});
