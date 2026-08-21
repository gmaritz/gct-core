export function createOpenApiServers(): ReadonlyArray<{ readonly url: string; readonly description: string }> {
	return [
		{
			url: "http://localhost:3000",
			description: "Local development server",
		},
	];
}
