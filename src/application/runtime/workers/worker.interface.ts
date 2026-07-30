export interface WorkerService {
	name(): string;
	register(): void;
	list(): string[];
	lookup(workerName: string): string | undefined;
}
