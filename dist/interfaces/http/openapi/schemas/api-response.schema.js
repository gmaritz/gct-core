"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagedResponseSchema = exports.apiResponseSchema = void 0;
exports.apiResponseSchema = {
    name: "ApiResponse",
    type: "object",
    properties: {
        status: {
            type: "string",
            description: "The status of the response payload.",
        },
        message: {
            type: "string",
            description: "An informative message describing the response.",
        },
    },
};
exports.pagedResponseSchema = {
    name: "PagedResponse",
    type: "object",
    properties: {
        items: {
            type: "array",
            items: {
                type: "object",
            },
        },
        page: {
            type: "integer",
            minimum: 1,
        },
        size: {
            type: "integer",
            minimum: 1,
        },
        total: {
            type: "integer",
            minimum: 0,
        },
    },
};
//# sourceMappingURL=api-response.schema.js.map