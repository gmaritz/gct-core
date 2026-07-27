"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const api_error_1 = require("./api-error");
class UnauthorizedError extends api_error_1.ApiError {
    constructor(detail = "Authentication is required to access this resource") {
        super(401, "Unauthorized", detail, "https://gct-core.dev/errors/unauthorized");
    }
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=unauthorized.error.js.map