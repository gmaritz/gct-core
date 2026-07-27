"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, title, detail, type) {
        super(detail);
        this.statusCode = statusCode;
        this.title = title;
        this.detail = detail;
        this.type = type;
        this.name = this.constructor.name;
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map