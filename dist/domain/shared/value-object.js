"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
/**
 * Value Object Base Class
 *
 * All value objects should extend this class.
 * Value objects are immutable and have no identity - they are defined by their attributes.
 */
class ValueObject {
    constructor(props) {
        this.props = Object.freeze(props);
    }
    equals(other) {
        if (!(other instanceof ValueObject)) {
            return false;
        }
        return JSON.stringify(this.props) === JSON.stringify(other.props);
    }
    getProps() {
        return this.props;
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.js.map