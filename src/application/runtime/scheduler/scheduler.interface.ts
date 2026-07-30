export interface SchedulerService {
	registerJob(jobName: string): void;
	removeJob(jobName: string): void;
	listJobs(): string[];
}
