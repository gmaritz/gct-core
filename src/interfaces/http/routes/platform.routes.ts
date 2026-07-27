import { Request, Response, Router } from "express";

import { PlatformInfoService } from "../../../application/platform";
import { isPrismaReady } from "../../../bootstrap/prisma";

export function createPlatformRouter(): Router {
	const router = Router();
	const platformInfoService = new PlatformInfoService();

	router.get("/", (_request: Request, response: Response) => {
		response.status(200).json(platformInfoService.getPlatformInfo());
	});

	router.get("/version", (_request: Request, response: Response) => {
		response.status(200).json(platformInfoService.getVersionInfo());
	});

	router.get("/live", (_request: Request, response: Response) => {
		response.status(200).json({
			status: "UP",
		});
	});

	router.get("/ready", (_request: Request, response: Response) => {
		const readinessDiagnostics = {
			database: isPrismaReady() ? "CONNECTED" : "DISCONNECTED",
			uptimeSeconds: platformInfoService.getUptime(),
			timestamp: new Date().toISOString(),
		};

		if (isPrismaReady()) {
			response.status(200).json({
				status: "READY",
				...readinessDiagnostics,
			});
			return;
		}

		response.status(503).json({
			status: "NOT_READY",
			...readinessDiagnostics,
		});
	});

	router.get("/health", (_request: Request, response: Response) => {
		const platformInfo = platformInfoService.getPlatformInfo();
		response.status(200).json({
			status: "UP",
			service: platformInfo.service,
			environment: platformInfo.environment,
			version: platformInfo.version,
			timestamp: new Date().toISOString(),
		});
	});

	return router;
}
