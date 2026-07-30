import { Logger } from "../../bootstrap/logging";
import { RuntimeRegistry } from "./runtime.registry";
import { RuntimeService } from "./runtime.service";

export class RuntimeManager {
	private readonly registry: RuntimeRegistry;
	private started = false;

	constructor(private readonly logger: Logger) {
		this.registry = new RuntimeRegistry(logger);
	}

	register(service: RuntimeService): void {
		this.registry.register(service);
	}

	async start(): Promise<void> {
		if (this.started) {
			return;
		}

		this.logger.info("Runtime Manager started");
		await this.registry.startAll();
		this.started = true;
		this.logger.info("Runtime services started", { services: this.registry.list() });
	}

	async stop(): Promise<void> {
		if (!this.started) {
			return;
		}

		await this.registry.stopAll();
		this.started = false;
		this.logger.info("Runtime shutdown completed");
	}

	async health(): Promise<{ status: string; services: Array<{ name: string; status: string; details?: Record<string, unknown> }> }> {
		const services = await this.registry.health();
		return {
			status: services.length === 0 ? "READY" : "READY",
			services,
		};
	}

	getRegistry(): RuntimeRegistry {
		return this.registry;
	}
}
