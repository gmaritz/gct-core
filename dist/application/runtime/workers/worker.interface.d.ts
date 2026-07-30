export interface WorkerService {
    name(): string;
    register(): void;
    list(): string[];
    lookup(workerName: string): string | undefined;
}
//# sourceMappingURL=worker.interface.d.ts.map