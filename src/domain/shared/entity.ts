/**
 * Entity Base Class
 * 
 * All entities within an aggregate should extend this class.
 * Entities have unique identity and continue to exist throughout their lifecycle.
 */
export abstract class Entity {
  protected readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  equals(other: Entity): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.getId();
  }
}
