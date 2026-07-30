import { createOpenApiInfo } from "./info";
import { OPENAPI_TAGS } from "./tags";
import { createOpenApiServers } from "./servers";
import { platformPaths } from "./paths/platform.paths";
import { apiResponseSchema, pagedResponseSchema } from "./schemas/api-response.schema";
import { problemDetailsSchema } from "./schemas/problem-details.schema";

export function createOpenApiDocument() {
	return {
		openapi: "3.1.0",
		info: createOpenApiInfo(),
		servers: createOpenApiServers(),
		tags: OPENAPI_TAGS,
		paths: platformPaths,
		components: {
			schemas: {
				ApiResponse: apiResponseSchema,
				PagedResponse: pagedResponseSchema,
				ProblemDetails: problemDetailsSchema,
			},
		},
	};
}
