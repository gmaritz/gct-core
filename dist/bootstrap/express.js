"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressApplication = createExpressApplication;
const crypto_1 = require("crypto");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("../interfaces/http/middleware/error.middleware");
const routes_1 = require("../interfaces/http/routes");
const LOCALHOST_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
function createCorsOptions(configuration) {
    const developmentOrigins = new Set(LOCALHOST_ORIGINS);
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
function createExpressApplication(configuration, logger) {
    const app = (0, express_1.default)();
    const corsOptions = createCorsOptions(configuration);
    app.set("trust proxy", true);
    app.disable("x-powered-by");
    app.use((request, response, next) => {
        const requestId = (0, crypto_1.randomUUID)();
        const requestWithId = request;
        requestWithId.requestId = requestId;
        response.setHeader("X-Request-Id", requestId);
        next();
    });
    app.use((request, response, next) => {
        const startedAt = process.hrtime.bigint();
        const requestId = request.requestId ?? "unknown";
        response.on("finish", () => {
            const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1000000;
            logger.info(`requestId=${requestId} method=${request.method} url=${request.originalUrl} status=${response.statusCode} durationMs=${elapsedMs.toFixed(2)}`);
        });
        next();
    });
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json());
    app.use((0, routes_1.createRootRouter)(configuration));
    app.use((_request, response) => {
        response.status(404).json({
            status: 404,
            error: "Not Found",
        });
    });
    app.use((0, error_middleware_1.createGlobalErrorMiddleware)(logger));
    return app;
}
//# sourceMappingURL=express.js.map