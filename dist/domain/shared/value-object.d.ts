/**
 * Value Object Base Class
 *
 * All value objects should extend this class.
 * Value objects are immutable and have no identity - they are defined by their attributes.
 */
export declare abstract class ValueObject {
    protected readonly props: Record<string, any>;
    constructor(props: Record<string, any>);
    equals(other: ValueObject): boolean;
    getProps(): Record<string, any>;
}
//# sourceMappingURL=value-object.d.ts.map