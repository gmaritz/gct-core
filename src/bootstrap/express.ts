import path from "path";
import { randomUUID } from "crypto";

import compression from "compression";
import cors, { CorsOptions } from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";

import { Logger } from "./logging";
import { createGlobalErrorMiddleware } from "../interfaces/http/middleware/error.middleware";
import { createRootRouter } from "../interfaces/http/routes";
import { ApplicationConfiguration } from "../config/configuration.service";
import { NotFoundError } from "../interfaces/http/errors";
import { createOpenApiRouter } from "../interfaces/http/openapi/openapi";

const LOCALHOST_ORIGINS = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

type RequestWithId = Request & { requestId?: string };

function resolveRequestId(request: Request): string {
	const incomingRequestId = request.header("X-Request-Id");
	if (typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0) {
		return incomingRequestId;
	}

	return randomUUID();
}

function createCorsOptions(configuration: ApplicationConfiguration): CorsOptions {
	const developmentOrigins = new Set<string>(LOCALHOST_ORIGINS);
	if (!configuration.security.corsEnabled || configuration.platform.environment !== "development") {
		return {
			origin: false,
		};
	}

	return {
		origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void): void => {
			if (!origin || developmentOrigins.has(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("CORS origin is not allowed"));
		},
	};
}

export function createExpressApplication(
	configuration: ApplicationConfiguration,
	logger: Logger,
	configure?: (application: Express) => void,
): Express {
	const app = express();
	const corsOptions = createCorsOptions(configuration);

	app.set("trust proxy", true);
	app.disable("x-powered-by");

	app.use((request: Request, response: Response, next: NextFunction) => {
		const requestId = resolveRequestId(request);
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
			logger.info("HTTP request completed", {
				requestId,
				method: request.method,
				url: request.originalUrl,
				status: response.statusCode,
				durationMs: Number(elapsedMs.toFixed(2)),
			});
		});

		next();
	});

	app.set("view engine", "ejs");
	app.set("views", path.join(process.cwd(), "src/interfaces/views"));
	app.use(express.static(path.join(process.cwd(), "public")));
	app.use(helmet());
	app.use(compression());
	app.use(cors(corsOptions));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	if (configure) {
		configure(app);
	}

	if (configuration.platform.environment === "development") {
		app.use(createOpenApiRouter());
	}

	app.use(createRootRouter());

	app.use((_request: Request, _response: Response, next: NextFunction) => {
		next(new NotFoundError());
	});

	app.use(createGlobalErrorMiddleware(logger));

	return app;
}
