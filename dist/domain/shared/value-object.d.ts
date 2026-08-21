/**
 * Value Object Base Class
 *
 * All value objects should extend this class.
 * Value objects are immutable and have no identity - they are defined by their attributes.
 */
export declare abstract class ValueObject<TProps> {
    protected readonly props: TProps;
    constructor(props: TProps);
    equals(other: ValueObject<TProps>): boolean;
    getProps(): TProps;
}
//# sourceMappingURL=value-object.d.ts.map