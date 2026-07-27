import { randomUUID } from "crypto";

import compression from "compression";
import cors, { CorsOptions } from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";

import { AppConfiguration } from "./configuration";
import { Logger } from "./logging";
import { createGlobalErrorMiddleware } from "../interfaces/http/middleware/error.middleware";
import { createRootRouter } from "../interfaces/http/routes";

const LOCALHOST_ORIGINS = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

type RequestWithId = Request & { requestId?: string };

function createCorsOptions(configuration: AppConfiguration): CorsOptions {
	const developmentOrigins = new Set<string>(LOCALHOST_ORIGINS);
	if (configuration.nodeEnv !== "development") {
		return {
			origin: false,
		};
	}

	return {
		origin: (origin, callback) => {
			if (!origin || developmentOrigins.has(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("CORS origin is not allowed"));
		},
	};
}

export function createExpressApplication(configuration: AppConfiguration, logger: Logger): Express {
	const app = express();
	const corsOptions = createCorsOptions(configuration);

	app.set("trust proxy", true);
	app.disable("x-powered-by");

	app.use((request: Request, response: Response, next: NextFunction) => {
		const requestId = randomUUID();
		const requestWithId = request as RequestWithId;
		requestWithId.requestId = requestId;
		response.setHeader("X-Request-Id", requestId);
		next();
	});

	app.use((request: Request, response: Response, next: NextFunction) => {
		const startedAt = process.hrtime.bigint();
		const requestId = (request as RequestWithId).requestId ?? "unknown";

		response.on("finish", () => {
			const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
			logger.info(
				`requestId=${requestId} method=${request.method} url=${request.originalUrl} status=${response.statusCode} durationMs=${elapsedMs.toFixed(2)}`,
			);
		});

		next();
	});

	app.use(helmet());
	app.use(compression());
	app.use(cors(corsOptions));
	app.use(express.json());

	app.use(createRootRouter(configuration));

	app.use((_request: Request, response: Response) => {
		response.status(404).json({
			status: 404,
			error: "Not Found",
		});
	});

	app.use(createGlobalErrorMiddleware(logger));

	return app;
}
