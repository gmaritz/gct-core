"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const api_error_1 = require("./api-error");
class InternalServerError extends api_error_1.ApiError {
    constructor(detail = "An unexpected error occurred") {
        super(500, "Internal Server Error", detail, "https://gct-core.dev/errors/internal-server-error");
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=internal-server.error.js.map