"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeRegistry = void 0;
class RuntimeRegistry {
    constructor(logger) {
        this.logger = logger;
        this.services = new Map();
    }
    register(service) {
        if (this.services.has(service.name())) {
            return;
        }
        this.services.set(service.name(), service);
        this.logger.info("Runtime service registered", { service: service.name() });
    }
    async startAll() {
        for (const service of this.services.values()) {
            await service.start();
        }
    }
    async stopAll() {
        for (const service of Array.from(this.services.values()).reverse()) {
            await service.stop();
        }
    }
    async health() {
        const results = [];
        for (const service of this.services.values()) {
            const health = await service.health();
            results.push({
                name: service.name(),
                status: health.status,
                details: health.details,
            });
        }
        return results;
    }
    list() {
        return Array.from(this.services.keys());
    }
}
exports.RuntimeRegistry = RuntimeRegistry;
//# sourceMappingURL=runtime.registry.js.map