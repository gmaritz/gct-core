"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Specification = exports.ValueObject = exports.Entity = exports.DomainException = exports.DomainEvent = exports.AggregateRoot = void 0;
/**
 * Domain Layer Index
 *
 * Shared exports from the domain shared module.
 */
var aggregate_root_1 = require("./aggregate-root");
Object.defineProperty(exports, "AggregateRoot", { enumerable: true, get: function () { return aggregate_root_1.AggregateRoot; } });
var domain_event_1 = require("./domain-event");
Object.defineProperty(exports, "DomainEvent", { enumerable: true, get: function () { return domain_event_1.DomainEvent; } });
var domain_exception_1 = require("./domain-exception");
Object.defineProperty(exports, "DomainException", { enumerable: true, get: function () { return domain_exception_1.DomainException; } });
var entity_1 = require("./entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return entity_1.Entity; } });
var value_object_1 = require("./value-object");
Object.defineProperty(exports, "ValueObject", { enumerable: true, get: function () { return value_object_1.ValueObject; } });
var specification_1 = require("./specification");
Object.defineProperty(exports, "Specification", { enumerable: true, get: function () { return specification_1.Specification; } });
//# sourceMappingURL=index.js.map