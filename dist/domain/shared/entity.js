"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
/**
 * Entity Base Class
 *
 * All entities within an aggregate should extend this class.
 * Entities have unique identity and continue to exist throughout their lifecycle.
 */
class Entity {
    constructor(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    equals(other) {
        if (!(other instanceof Entity)) {
            return false;
        }
        return this.id === other.getId();
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map