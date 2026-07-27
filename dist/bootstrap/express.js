"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressApplication = createExpressApplication;
const express_1 = __importDefault(require("express"));
const SERVICE_NAME = "gct-core";
const DEFAULT_VERSION = "1.0.0";
function createExpressApplication(configuration) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get("/health", (_request, response) => {
        response.status(200).json({
            status: "UP",
            service: SERVICE_NAME,
            environment: configuration.nodeEnv,
            version: process.env.npm_package_version ?? DEFAULT_VERSION,
            timestamp: new Date().toISOString(),
        });
    });
    app.use((_request, response) => {
        response.status(404).json({
            status: 404,
            error: "Not Found",
        });
    });
    return app;
}
//# sourceMappingURL=express.js.map