import request, { Response } from "supertest";

import { Express } from "express";

export function createRequest(agent: Express, method: "get" | "post" | "put" | "delete") {
	return (path: string, headers: Record<string, string> = {}) => {
		const requestBuilder = request(agent)[method](path);
		for (const [name, value] of Object.entries(headers)) {
			requestBuilder.set(name, value);
		}
		return requestBuilder;
	};
}

export function expectJsonResponse(response: Response, expectedStatus: number): void {
	expect(response.status).toBe(expectedStatus);
	expect(response.headers["content-type"]).toContain("application/json");
}

export function expectProblemDetailsResponse(response: Response, expectedStatus: number): void {
	expect(response.status).toBe(expectedStatus);
	expect(response.headers["content-type"]).toContain("application/problem+json");
	expect(response.body).toEqual(
		expect.objectContaining({
			type: expect.any(String),
			title: expect.any(String),
			status: expect.any(Number),
			detail: expect.any(String),
			instance: expect.any(String),
			timestamp: expect.any(String),
		}),
	);
	expect(response.body).not.toHaveProperty("stack");
}
