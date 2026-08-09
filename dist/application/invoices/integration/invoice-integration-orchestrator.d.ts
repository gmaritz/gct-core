import { ApplicationService } from "../../application-service";
import { InvoiceAccountingGateway } from "./invoice-accounting-gateway";
import { InvoiceIntegrationMapper } from "./invoice-integration-mapper";
import { InvoiceIntegrationRequest, InvoiceIntegrationResult } from "./models";
export declare class InvoiceIntegrationOrchestrator implements ApplicationService<InvoiceIntegrationRequest, InvoiceIntegrationResult> {
    private readonly gateway;
    private readonly mapper;
    constructor(gateway: InvoiceAccountingGateway, mapper?: InvoiceIntegrationMapper);
    execute(request: InvoiceIntegrationRequest): Promise<InvoiceIntegrationResult>;
}
//# sourceMappingURL=invoice-integration-orchestrator.d.ts.map