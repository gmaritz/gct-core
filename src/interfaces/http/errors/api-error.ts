export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly title: string;
	public readonly detail: string;
	public readonly type: string;

	constructor(statusCode: number, title: string, detail: string, type: string) {
		super(detail);
		this.statusCode = statusCode;
		this.title = title;
		this.detail = detail;
		this.type = type;
		this.name = this.constructor.name;
	}
}
