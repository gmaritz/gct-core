import { ApplicationService } from "../../application-service";
import { BookingGateway } from "./booking-gateway";
import { BookingIntegrationRequest, BookingIntegrationResult } from "./models";
export declare class BookingIntegrationOrchestrator implements ApplicationService<BookingIntegrationRequest, BookingIntegrationResult> {
    private readonly gateway;
    constructor(gateway: BookingGateway);
    execute(request: BookingIntegrationRequest): Promise<BookingIntegrationResult>;
}
//# sourceMappingURL=booking-integration-orchestrator.d.ts.map