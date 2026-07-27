import { ApiError } from "./api-error";

export class ConflictError extends ApiError {
	constructor(detail = "The request could not be completed due to a conflict") {
		super(409, "Conflict", detail, "https://gct-core.dev/errors/conflict");
	}
}
