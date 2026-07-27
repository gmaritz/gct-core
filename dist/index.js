"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./bootstrap/application");
async function main() {
    await (0, application_1.bootstrapApplication)();
}
main().catch((error) => {
    console.error("Fatal startup error", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map