import { NextFunction, Request, Response } from "express";
import { DevelopmentIngressConfig } from "../../../config/development-ingress.config";
declare module "express-serve-static-core" {
    interface Request {
        developmentPayFastSource?: string;
    }
}
export declare function isAllowedDevelopmentIngressRoute(method: string, rawUrl: string): boolean;
export declare function createDevelopmentIngressMiddleware(config: DevelopmentIngressConfig): (request: Request, response: Response, next: NextFunction) => void;
//# sourceMappingURL=development-ingress.middleware.d.ts.map