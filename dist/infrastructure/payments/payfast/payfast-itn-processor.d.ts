import { PaymentAttemptRepository } from "@application/payments";
import { ReservationRepository } from "@application/reservations/repository";
import { PayFastItnServerValidator } from "./payfast-itn-security";
import type { PayFastIntegrationConfig } from "./index";
export interface PayFastItnProcessResult {
    readonly status: "APPLIED" | "DUPLICATE";
    readonly paymentReference: string;
}
export declare class PayFastItnProcessor {
    private readonly config;
    private readonly paymentAttemptRepository;
    private readonly reservationRepository;
    private readonly serverValidator;
    constructor(config: PayFastIntegrationConfig, paymentAttemptRepository: PaymentAttemptRepository, reservationRepository: ReservationRepository, serverValidator: PayFastItnServerValidator);
    process(rawBody: Buffer, peerAddress: string): Promise<PayFastItnProcessResult>;
}
//# sourceMappingURL=payfast-itn-processor.d.ts.map