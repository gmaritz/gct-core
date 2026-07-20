import { AggregateRoot } from '../shared/aggregate-root';
/**
 * Traveller Aggregate Root
 *
 * Represents a long-term relationship with a traveller.
 * Encapsulates traveller identity, preferences, and history.
 */
export declare class Traveller extends AggregateRoot {
    private firstName;
    private lastName;
    private email;
    private preferences;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(firstName: string, lastName: string, email: string): Traveller;
    static restore(id: string, firstName: string, lastName: string, email: string, preferences: Record<string, any>, createdAt: Date, updatedAt: Date): Traveller;
    getFirstName(): string;
    getLastName(): string;
    getFullName(): string;
    getEmail(): string;
    getPreferences(): Record<string, any>;
    updatePreferences(preferences: Record<string, any>): void;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    isValid(): boolean;
}
//# sourceMappingURL=traveller.aggregate.d.ts.map