import { NextFunction, Request, Response } from "express";
import { Logger } from "../../../bootstrap/logging";
export declare function createGlobalErrorMiddleware(logger: Logger): (error: unknown, request: Request, response: Response, _next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map