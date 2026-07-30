"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeManager = void 0;
const runtime_registry_1 = require("./runtime.registry");
class RuntimeManager {
    constructor(logger) {
        this.logger = logger;
        this.started = false;
        this.registry = new runtime_registry_1.RuntimeRegistry(logger);
    }
    register(service) {
        this.registry.register(service);
    }
    async start() {
        if (this.started) {
            return;
        }
        this.logger.info("Runtime Manager started");
        await this.registry.startAll();
        this.started = true;
        this.logger.info("Runtime services started", { services: this.registry.list() });
    }
    async stop() {
        if (!this.started) {
            return;
        }
        await this.registry.stopAll();
        this.started = false;
        this.logger.info("Runtime shutdown completed");
    }
    async health() {
        const services = await this.registry.health();
        return {
            status: services.length === 0 ? "READY" : "READY",
            services,
        };
    }
    getRegistry() {
        return this.registry;
    }
}
exports.RuntimeManager = RuntimeManager;
//# sourceMappingURL=runtime.manager.js.map