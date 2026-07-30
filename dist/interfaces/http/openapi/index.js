"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiDocument = createOpenApiDocument;
const info_1 = require("./info");
const tags_1 = require("./tags");
const servers_1 = require("./servers");
const platform_paths_1 = require("./paths/platform.paths");
const api_response_schema_1 = require("./schemas/api-response.schema");
const problem_details_schema_1 = require("./schemas/problem-details.schema");
function createOpenApiDocument() {
    return {
        openapi: "3.1.0",
        info: (0, info_1.createOpenApiInfo)(),
        servers: (0, servers_1.createOpenApiServers)(),
        tags: tags_1.OPENAPI_TAGS,
        paths: platform_paths_1.platformPaths,
        components: {
            schemas: {
                ApiResponse: api_response_schema_1.apiResponseSchema,
                PagedResponse: api_response_schema_1.pagedResponseSchema,
                ProblemDetails: problem_details_schema_1.problemDetailsSchema,
            },
        },
    };
}
//# sourceMappingURL=index.js.map