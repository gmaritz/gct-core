"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const api_error_1 = require("./api-error");
class ForbiddenError extends api_error_1.ApiError {
    constructor(detail = "You are not allowed to access this resource") {
        super(403, "Forbidden", detail, "https://gct-core.dev/errors/forbidden");
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=forbidden.error.js.map