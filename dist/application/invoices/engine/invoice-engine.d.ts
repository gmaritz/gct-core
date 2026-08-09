import { ApplicationService } from "@application/application-service";
import { InvoiceEngineResult } from "./models";
import { InvoiceEngineRequest } from "./models/invoice-engine-context";
import { InvoiceOperationHandler } from "./operations";
export declare class InvoiceEngine implements ApplicationService<InvoiceEngineRequest, InvoiceEngineResult> {
    private readonly operationHandlers;
    constructor(handlers?: ReadonlyArray<InvoiceOperationHandler>);
    execute(request: InvoiceEngineRequest): Promise<InvoiceEngineResult>;
    private executeOperation;
}
//# sourceMappingURL=invoice-engine.d.ts.map