export const platformPaths = {
	"/": {
		get: {
			tags: ["Platform"],
			summary: "Get platform metadata",
			responses: {
				"200": {
					description: "Platform metadata response",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
	"/health": {
		get: {
			tags: ["Health"],
			summary: "Get health status",
			responses: {
				"200": {
					description: "The service is healthy",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
	"/live": {
		get: {
			tags: ["Health"],
			summary: "Check liveness",
			responses: {
				"200": {
					description: "The service is alive",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
	"/ready": {
		get: {
			tags: ["Health"],
			summary: "Check readiness",
			responses: {
				"200": {
					description: "The service is ready",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
				"503": {
					description: "The service is not ready",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
	"/version": {
		get: {
			tags: ["System"],
			summary: "Get version metadata",
			responses: {
				"200": {
					description: "Version metadata response",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
	"/api/v1": {
		get: {
			tags: ["System"],
			summary: "Get API v1 metadata",
			responses: {
				"200": {
					description: "API v1 metadata response",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ApiResponse",
							},
						},
					},
				},
			},
		},
	},
};
