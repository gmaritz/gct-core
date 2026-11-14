import { Server } from "http";
import { createExpressApplication } from "./express";
export declare function bootstrapApplication(): Promise<void>;
export declare function startHttpServer(expressApplication: ReturnType<typeof createExpressApplication>, port: number, host?: string): Promise<Server>;
//# sourceMappingURL=application.d.ts.map