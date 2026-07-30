"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggingConfig = createLoggingConfig;
function createLoggingConfig(level) {
    return {
        level,
        structured: true,
        requestLoggingEnabled: true,
    };
}
//# sourceMappingURL=logging.config.js.map