import { NextFunction, Request, Response } from "express";

import { Logger } from "../../../bootstrap/logging";
import { ProblemDetails } from "../dto/problem-details";
import { ApiError, InternalServerError } from "../errors";

function mapToApiError(error: unknown): ApiError {
	if (error instanceof ApiError) {
		return error;
	}

	return new InternalServerError();
}

export function createGlobalErrorMiddleware(logger: Logger) {
	return (error: unknown, request: Request, response: Response, _next: NextFunction): void => {
		const apiError = mapToApiError(error);

		if (!(error instanceof ApiError)) {
			logger.error("Unhandled exception", error instanceof Error ? { message: error.message, stack: error.stack } : { error });
		}

		const problemDetails: ProblemDetails = {
			type: apiError.type,
			title: apiError.title,
			status: apiError.statusCode,
			detail: apiError.detail,
			instance: request.originalUrl,
			timestamp: new Date().toISOString(),
		};

		response
			.status(apiError.statusCode)
			.contentType("application/problem+json")
			.json(problemDetails);
	};
}
