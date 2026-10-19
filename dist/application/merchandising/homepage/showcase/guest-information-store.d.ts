import { GuestInformationInput } from "./guest-information-service";
export declare class GuestInformationStore {
    private readonly information;
    save(ownerId: string, journeyId: string, input: GuestInformationInput): void;
    find(ownerId: string, journeyId: string): GuestInformationInput | undefined;
    clear(ownerId: string, journeyId: string): void;
}
export declare const guestInformationStore: GuestInformationStore;
//# sourceMappingURL=guest-information-store.d.ts.map