import { ApiError } from "./api-error";

export class NotFoundError extends ApiError {
	constructor(detail = "The requested resource was not found") {
		super(404, "Not Found", detail, "https://gct-core.dev/errors/not-found");
	}
}
