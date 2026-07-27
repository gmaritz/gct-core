import { ApiError } from "./api-error";

export class BadRequestError extends ApiError {
	constructor(detail = "The request payload is invalid") {
		super(400, "Bad Request", detail, "https://gct-core.dev/errors/bad-request");
	}
}
