/**
 * Value Object Base Class
 * 
 * All value objects should extend this class.
 * Value objects are immutable and have no identity - they are defined by their attributes.
 */
export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(other: ValueObject<TProps>): boolean {
    if (!(other instanceof ValueObject)) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  getProps(): TProps {
    return this.props;
  }
}
