/**
 * Entity Base Class
 *
 * All entities within an aggregate should extend this class.
 * Entities have unique identity and continue to exist throughout their lifecycle.
 */
export declare abstract class Entity {
    protected readonly id: string;
    constructor(id: string);
    getId(): string;
    equals(other: Entity): boolean;
}
//# sourceMappingURL=entity.d.ts.map