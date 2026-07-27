import { ApiError } from "./api-error";

export class InternalServerError extends ApiError {
	constructor(detail = "An unexpected error occurred") {
		super(500, "Internal Server Error", detail, "https://gct-core.dev/errors/internal-server-error");
	}
}
