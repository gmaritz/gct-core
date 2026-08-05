"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationEngine = void 0;
const discovery_1 = require("../discovery");
class DefaultAccommodationEngine {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async search(query) {
        const discoveryEngine = new discovery_1.DefaultAccommodationDiscoveryEngine(this.providerRegistry);
        return discoveryEngine.search(query);
    }
}
exports.DefaultAccommodationEngine = DefaultAccommodationEngine;
//# sourceMappingURL=accommodation-engine.js.map