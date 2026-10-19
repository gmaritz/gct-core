import { Express } from "express";
import { Logger } from "./logging";
import { ApplicationConfiguration } from "../config/configuration.service";
import { AnonymousSessionService } from "../application/sessions";
export declare function createExpressApplication(configuration: ApplicationConfiguration, logger: Logger, configure?: (application: Express) => void, anonymousSessionService?: AnonymousSessionService): Express;
//# sourceMappingURL=express.d.ts.map