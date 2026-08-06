"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationEngine = void 0;
const discovery_1 = require("../discovery");
class DefaultAccommodationEngine {
    constructor(providerRegistry, queryValidator = new discovery_1.AccommodationQueryValidator()) {
        this.providerRegistry = providerRegistry;
        this.queryValidator = queryValidator;
    }
    async search(query) {
        const discoveryEngine = new discovery_1.DefaultAccommodationDiscoveryEngine(this.providerRegistry, this.queryValidator);
        return discoveryEngine.search(query);
    }
}
exports.DefaultAccommodationEngine = DefaultAccommodationEngine;
//# sourceMappingURL=accommodation-engine.js.map