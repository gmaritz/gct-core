"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalErrorMiddleware = createGlobalErrorMiddleware;
const errors_1 = require("../errors");
function mapToApiError(error) {
    if (error instanceof errors_1.ApiError) {
        return error;
    }
    return new errors_1.InternalServerError();
}
function createGlobalErrorMiddleware(logger) {
    return (error, request, response, _next) => {
        const apiError = mapToApiError(error);
        if (!(error instanceof errors_1.ApiError)) {
            logger.error("Unhandled exception", error instanceof Error ? { message: error.message, stack: error.stack } : { error });
        }
        const problemDetails = {
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
//# sourceMappingURL=error.middleware.js.map