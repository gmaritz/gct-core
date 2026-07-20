/**
 * Value Object Base Class
 * 
 * All value objects should extend this class.
 * Value objects are immutable and have no identity - they are defined by their attributes.
 */
export abstract class ValueObject {
  protected readonly props: Record<string, any>;

  constructor(props: Record<string, any>) {
    this.props = Object.freeze(props);
  }

  equals(other: ValueObject): boolean {
    if (!(other instanceof ValueObject)) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  getProps(): Record<string, any> {
    return this.props;
  }
}
