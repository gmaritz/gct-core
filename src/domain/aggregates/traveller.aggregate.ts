import { v4 as uuidv4 } from 'uuid';
import { AggregateRoot } from '../shared/aggregate-root';
import { EmailAddress } from '../value-objects/email-address.vo';
import { TravellerCreatedEvent, TravellerProfileUpdatedEvent } from '../events/traveller.event';
import { TravellerPreferences } from '../shared';

/**
 * Traveller Aggregate Root
 * 
 * Represents a long-term relationship with a traveller.
 * Encapsulates traveller identity, preferences, and history.
 */
export class Traveller extends AggregateRoot {
  private firstName: string;
  private lastName: string;
  private email: EmailAddress;
  private preferences: TravellerPreferences;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: EmailAddress,
    preferences: TravellerPreferences = {},
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id);
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.preferences = preferences;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    firstName: string,
    lastName: string,
    email: string
  ): Traveller {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    const emailVo = EmailAddress.create(email);
    const id = uuidv4();
    const traveller = new Traveller(
      id,
      firstName.trim(),
      lastName.trim(),
      emailVo
    );

    traveller.addDomainEvent(
      new TravellerCreatedEvent(id, firstName, lastName, email)
    );

    return traveller;
  }

  static restore(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    preferences: TravellerPreferences,
    createdAt: Date,
    updatedAt: Date
  ): Traveller {
    const emailVo = EmailAddress.create(email);
    return new Traveller(id, firstName, lastName, emailVo, preferences, createdAt, updatedAt);
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getEmail(): string {
    return this.email.value;
  }

  getPreferences(): TravellerPreferences {
    return { ...this.preferences };
  }

  updateProfile(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new TravellerProfileUpdatedEvent(this.id, this.firstName, this.lastName)
    );
  }

  updatePreferences(preferences: TravellerPreferences): void {
    this.preferences = { ...preferences };
    this.updatedAt = new Date();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isValid(): boolean {
    return (
      this.firstName.length > 0 &&
      this.lastName.length > 0 &&
      this.email !== null
    );
  }
}
