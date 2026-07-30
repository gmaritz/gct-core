import { Logger } from "../../../bootstrap/logging";
import { RuntimeService, RuntimeServiceStatus } from "../runtime.service";
import { SchedulerService } from "./scheduler.interface";

export class InMemorySchedulerService implements RuntimeService, SchedulerService {
	private readonly jobs = new Set<string>();
	private runtimeStatus: RuntimeServiceStatus = "STOPPED";

	constructor(private readonly logger: Logger) {}

	name(): string {
		return "scheduler";
	}

	async start(): Promise<void> {
		this.runtimeStatus = "RUNNING";
		this.logger.info("Scheduler runtime service started");
	}

	async stop(): Promise<void> {
		this.runtimeStatus = "STOPPED";
		this.logger.info("Scheduler runtime service stopped");
	}

	async health(): Promise<{ status: string; details?: Record<string, unknown> }> {
		return {
			status: this.runtimeStatus === "RUNNING" ? "UP" : "DOWN",
			details: { jobs: this.jobs.size },
		};
	}

	status(): RuntimeServiceStatus {
		return this.runtimeStatus;
	}

	registerJob(jobName: string): void {
		this.jobs.add(jobName);
	}

	removeJob(jobName: string): void {
		this.jobs.delete(jobName);
	}

	listJobs(): string[] {
		return Array.from(this.jobs);
	}
}
