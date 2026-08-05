import { CampaignPolicy } from "./campaign-policy";
import { CollectionPolicy } from "./collection-policy";
import { FeaturedJourneyPolicy } from "./featured-journey-policy";
import { JourneyEligibilityPolicy } from "./journey-eligibility-policy";
import { SeasonalPriorityPolicy } from "./seasonal-priority-policy";

export * from "./campaign-policy";
export * from "./seasonal-priority-policy";
export * from "./journey-eligibility-policy";
export * from "./featured-journey-policy";
export * from "./collection-policy";

export interface HomepageMerchandisingPolicies {
	campaignPolicy: CampaignPolicy;
	seasonalPriorityPolicy: SeasonalPriorityPolicy;
	journeyEligibilityPolicy: JourneyEligibilityPolicy;
	featuredJourneyPolicy: FeaturedJourneyPolicy;
	collectionPolicy: CollectionPolicy;
}

export function createPlaceholderHomepageMerchandisingPolicies(): HomepageMerchandisingPolicies {
	return {
		campaignPolicy: {},
		seasonalPriorityPolicy: {},
		journeyEligibilityPolicy: {},
		featuredJourneyPolicy: {},
		collectionPolicy: {},
	};
}
