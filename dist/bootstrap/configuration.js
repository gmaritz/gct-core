"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfiguration = loadConfiguration;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function parseEnvValue(rawValue) {
    const value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}
function loadEnvironmentFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return;
    }
    const contents = fs_1.default.readFileSync(filePath, "utf8");
    const lines = contents.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex <= 0) {
            continue;
        }
        const key = trimmed.slice(0, separatorIndex).trim();
        const value = parseEnvValue(trimmed.slice(separatorIndex + 1));
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}
function parsePort(rawPort) {
    if (!rawPort) {
        return 3000;
    }
    const port = Number.parseInt(rawPort, 10);
    if (Number.isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid PORT value: ${rawPort}`);
    }
    return port;
}
function parseNodeEnv(rawNodeEnv) {
    const fallback = "development";
    const candidate = (rawNodeEnv ?? fallback).toLowerCase();
    if (candidate === "development" || candidate === "test" || candidate === "production") {
        return candidate;
    }
    throw new Error(`Invalid NODE_ENV value: ${rawNodeEnv}`);
}
function loadConfiguration() {
    const envPath = path_1.default.resolve(process.cwd(), ".env");
    loadEnvironmentFile(envPath);
    const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
    const port = parsePort(process.env.PORT);
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("Missing required configuration: DATABASE_URL");
    }
    return {
        nodeEnv,
        port,
        databaseUrl,
    };
}
//# sourceMappingURL=configuration.js.map