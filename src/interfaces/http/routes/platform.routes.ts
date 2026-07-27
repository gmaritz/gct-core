import { Request, Response, Router } from "express";

import { AppConfiguration } from "../../../bootstrap/configuration";
import { isPrismaReady } from "../../../bootstrap/prisma";

const SERVICE_NAME = "gct-core";
const PLATFORM_NAME = "Go Cape Tours Core Platform";
const DEFAULT_VERSION = "1.0.0";

export function createPlatformRouter(configuration: AppConfiguration): Router {
	const router = Router();
	const version = process.env.npm_package_version ?? DEFAULT_VERSION;
	const build = process.env.BUILD_VERSION ?? "development";

	router.get("/", (_request: Request, response: Response) => {
		response.status(200).json({
			service: SERVICE_NAME,
			name: PLATFORM_NAME,
			version,
			environment: configuration.nodeEnv,
		});
	});

	router.get("/version", (_request: Request, response: Response) => {
		response.status(200).json({
			service: SERVICE_NAME,
			version,
			environment: configuration.nodeEnv,
			build,
			timestamp: new Date().toISOString(),
		});
	});

	router.get("/live", (_request: Request, response: Response) => {
		response.status(200).json({
			status: "UP",
		});
	});

	router.get("/ready", (_request: Request, response: Response) => {
		if (isPrismaReady()) {
			response.status(200).json({
				status: "READY",
			});
			return;
		}

		response.status(503).json({
			status: "NOT_READY",
		});
	});

	router.get("/health", (_request: Request, response: Response) => {
		response.status(200).json({
			status: "UP",
			service: SERVICE_NAME,
			environment: configuration.nodeEnv,
			version,
			timestamp: new Date().toISOString(),
		});
	});

	return router;
}
