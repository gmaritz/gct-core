import request, { Response } from "supertest";

import { Express } from "express";

const agents = new WeakMap<Express, ReturnType<typeof request.agent>>();

function getAgent(application: Express): ReturnType<typeof request.agent> {
	let agent = agents.get(application);
	if (!agent) {
		agent = request.agent(application);
		agents.set(application, agent);
	}
	return agent;
}

export function createRequest(agent: Express, method: "get" | "post" | "put" | "delete") {
	return (path: string, headers: Record<string, string> = {}) => {
		const requestBuilder = getAgent(agent)[method](path);
		for (const [name, value] of Object.entries(headers)) {
			requestBuilder.set(name, value);
		}
		return requestBuilder;
	};
}

export async function getCsrfToken(application: Express): Promise<string> {
	const response = await getAgent(application).get("/ui/404");
	const token = /<meta name="csrf-token" content="([A-Za-z0-9_-]{43})">/.exec(response.text)?.[1];
	if (!token) throw new Error("Frontend response did not contain a CSRF token.");
	return token;
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
