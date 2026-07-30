"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySchedulerService = void 0;
class InMemorySchedulerService {
    constructor(logger) {
        this.logger = logger;
        this.jobs = new Set();
        this.runtimeStatus = "STOPPED";
    }
    name() {
        return "scheduler";
    }
    async start() {
        this.runtimeStatus = "RUNNING";
        this.logger.info("Scheduler runtime service started");
    }
    async stop() {
        this.runtimeStatus = "STOPPED";
        this.logger.info("Scheduler runtime service stopped");
    }
    async health() {
        return {
            status: this.runtimeStatus === "RUNNING" ? "UP" : "DOWN",
            details: { jobs: this.jobs.size },
        };
    }
    status() {
        return this.runtimeStatus;
    }
    registerJob(jobName) {
        this.jobs.add(jobName);
    }
    removeJob(jobName) {
        this.jobs.delete(jobName);
    }
    listJobs() {
        return Array.from(this.jobs);
    }
}
exports.InMemorySchedulerService = InMemorySchedulerService;
//# sourceMappingURL=scheduler.service.js.map