"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryWorkerRegistry = void 0;
class InMemoryWorkerRegistry {
    constructor(logger) {
        this.logger = logger;
        this.workers = new Set();
        this.runtimeStatus = "STOPPED";
    }
    name() {
        return "workers";
    }
    async start() {
        this.runtimeStatus = "RUNNING";
        this.logger.info("Worker runtime service started");
    }
    async stop() {
        this.runtimeStatus = "STOPPED";
        this.logger.info("Worker runtime service stopped");
    }
    async health() {
        return {
            status: this.runtimeStatus === "RUNNING" ? "UP" : "DOWN",
            details: { workers: this.workers.size },
        };
    }
    status() {
        return this.runtimeStatus;
    }
    register() {
        this.workers.add(this.name());
    }
    list() {
        return Array.from(this.workers);
    }
    lookup(workerName) {
        return this.workers.has(workerName) ? workerName : undefined;
    }
}
exports.InMemoryWorkerRegistry = InMemoryWorkerRegistry;
//# sourceMappingURL=worker.registry.js.map