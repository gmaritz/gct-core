import { ApiError } from "./api-error";

export class UnauthorizedError extends ApiError {
	constructor(detail = "Authentication is required to access this resource") {
		super(401, "Unauthorized", detail, "https://gct-core.dev/errors/unauthorized");
	}
}
