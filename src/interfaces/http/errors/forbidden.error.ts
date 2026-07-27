import { ApiError } from "./api-error";

export class ForbiddenError extends ApiError {
	constructor(detail = "You are not allowed to access this resource") {
		super(403, "Forbidden", detail, "https://gct-core.dev/errors/forbidden");
	}
}
