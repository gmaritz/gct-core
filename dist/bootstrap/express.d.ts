import { Express } from "express";
import { Logger } from "./logging";
import { ApplicationConfiguration } from "../config/configuration.service";
export declare function createExpressApplication(configuration: ApplicationConfiguration, logger: Logger, configure?: (application: Express) => void): Express;
//# sourceMappingURL=express.d.ts.map