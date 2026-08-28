import { CTAViewModel } from "../shared/cta.viewmodel";
export interface GuestInformationTravellerViewModel {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly travellerType: "ADULT" | "CHILD";
    readonly dateOfBirth?: string;
    readonly nationality?: string;
}
export interface GuestInformationViewModel {
    readonly journeyId: string;
    readonly journeyTitle: string;
    readonly contact: {
        readonly email: string;
        readonly phone?: string;
    };
    readonly leadTravellerIndex: number;
    readonly travellers: ReadonlyArray<GuestInformationTravellerViewModel>;
    readonly errors: ReadonlyArray<string>;
    readonly complete: boolean;
    readonly continuation?: CTAViewModel;
}
//# sourceMappingURL=guest-information.viewmodel.d.ts.map