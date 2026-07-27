"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const api_error_1 = require("./api-error");
class BadRequestError extends api_error_1.ApiError {
    constructor(detail = "The request payload is invalid") {
        super(400, "Bad Request", detail, "https://gct-core.dev/errors/bad-request");
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=bad-request.error.js.map