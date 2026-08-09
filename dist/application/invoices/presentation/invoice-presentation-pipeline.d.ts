import { InvoicePresentationRequest, InvoicePresentationResult } from "./models";
import { InvoicePresentationMapper } from "./invoice-presentation-mapper";
export declare class InvoicePresentationPipeline {
    private readonly mapper;
    constructor(mapper?: InvoicePresentationMapper);
    execute(request: InvoicePresentationRequest): InvoicePresentationResult;
}
//# sourceMappingURL=invoice-presentation-pipeline.d.ts.map