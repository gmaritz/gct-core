import { GuestInformationInput } from "./guest-information-service";
export declare class GuestInformationStore {
    private readonly information;
    save(journeyId: string, input: GuestInformationInput): void;
    find(journeyId: string): GuestInformationInput | undefined;
}
export declare const guestInformationStore: GuestInformationStore;
//# sourceMappingURL=guest-information-store.d.ts.map