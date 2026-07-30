import { Logger } from "../../../bootstrap/logging";
import { RuntimeService, RuntimeServiceStatus } from "../runtime.service";
import { WorkerService } from "./worker.interface";

export class InMemoryWorkerRegistry implements RuntimeService, WorkerService {
	private readonly workers = new Set<string>();
	private runtimeStatus: RuntimeServiceStatus = "STOPPED";

	constructor(private readonly logger: Logger) {}

	name(): string {
		return "workers";
	}

	async start(): Promise<void> {
		this.runtimeStatus = "RUNNING";
		this.logger.info("Worker runtime service started");
	}

	async stop(): Promise<void> {
		this.runtimeStatus = "STOPPED";
		this.logger.info("Worker runtime service stopped");
	}

	async health(): Promise<{ status: string; details?: Record<string, unknown> }> {
		return {
			status: this.runtimeStatus === "RUNNING" ? "UP" : "DOWN",
			details: { workers: this.workers.size },
		};
	}

	status(): RuntimeServiceStatus {
		return this.runtimeStatus;
	}

	register(): void {
		this.workers.add(this.name());
	}

	list(): string[] {
		return Array.from(this.workers);
	}

	lookup(workerName: string): string | undefined {
		return this.workers.has(workerName) ? workerName : undefined;
	}
}
