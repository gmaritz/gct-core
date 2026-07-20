"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Specification = void 0;
class Specification {
    and(other) {
        return new CompositeSpecification(this, other, 'AND');
    }
    or(other) {
        return new CompositeSpecification(this, other, 'OR');
    }
    not() {
        return new NegationSpecification(this);
    }
}
exports.Specification = Specification;
class CompositeSpecification extends Specification {
    constructor(left, right, operator) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
    isSatisfiedBy(candidate) {
        if (this.operator === 'AND') {
            return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
        }
        else {
            return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
        }
    }
}
class NegationSpecification extends Specification {
    constructor(specification) {
        super();
        this.specification = specification;
    }
    isSatisfiedBy(candidate) {
        return !this.specification.isSatisfiedBy(candidate);
    }
}
//# sourceMappingURL=specification.js.map