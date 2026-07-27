import express, { Express, Request, Response } from "express";

import { AppConfiguration } from "./configuration";

const SERVICE_NAME = "gct-core";
const DEFAULT_VERSION = "1.0.0";

export function createExpressApplication(configuration: AppConfiguration): Express {
	const app = express();

	app.use(express.json());

	app.get("/health", (_request: Request, response: Response) => {
		response.status(200).json({
			status: "UP",
			service: SERVICE_NAME,
			environment: configuration.nodeEnv,
			version: process.env.npm_package_version ?? DEFAULT_VERSION,
			timestamp: new Date().toISOString(),
		});
	});

	app.use((_request: Request, response: Response) => {
		response.status(404).json({
			status: 404,
			error: "Not Found",
		});
	});

	return app;
}
