import { ValueObject } from '../shared/value-object';

/**
 * Email Address Value Object
 * 
 * Represents a validated email address.
 * Email addresses are immutable and compared by value.
 */
export class EmailAddress extends ValueObject {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(email: string): EmailAddress {
    const trimmed = email.trim().toLowerCase();
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmed)) {
      throw new Error('Invalid email address format');
    }

    return new EmailAddress({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }

  static isValid(email: string): boolean {
    try {
      EmailAddress.create(email);
      return true;
    } catch {
      return false;
    }
  }
}
