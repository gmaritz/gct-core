export const apiResponseSchema = {
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

export const pagedResponseSchema = {
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
