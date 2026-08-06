import { JourneyPresentationMapper } from "../mapper/journey-presentation-mapper";
import { JourneyPresentationModel } from "../models/journey-presentation-model";
import { HomepageJourneyViewModel } from "../view-models/homepage-journey.viewmodel";
export declare class JourneyViewModelProvider {
    private readonly mapper;
    constructor(mapper?: JourneyPresentationMapper);
    provideHomepageJourney(model: JourneyPresentationModel): HomepageJourneyViewModel;
    mapCompositionResultToHomepageJourney(result: Parameters<JourneyPresentationMapper["map"]>[0]): HomepageJourneyViewModel | null;
}
//# sourceMappingURL=journey-view-model-provider.d.ts.map