import { Logger } from "../../bootstrap/logging";
import { RuntimeService } from "./runtime.service";

export class RuntimeRegistry {
	private readonly services = new Map<string, RuntimeService>();

	constructor(private readonly logger: Logger) {}

	register(service: RuntimeService): void {
		if (this.services.has(service.name())) {
			return;
		}

		this.services.set(service.name(), service);
		this.logger.info("Runtime service registered", { service: service.name() });
	}

	async startAll(): Promise<void> {
		for (const service of this.services.values()) {
			await service.start();
		}
	}

	async stopAll(): Promise<void> {
		for (const service of Array.from(this.services.values()).reverse()) {
			await service.stop();
		}
	}

	async health(): Promise<Array<{ name: string; status: string; details?: Record<string, unknown> }>> {
		const results: Array<{ name: string; status: string; details?: Record<string, unknown> }> = [];
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

	list(): string[] {
		return Array.from(this.services.keys());
	}
}
