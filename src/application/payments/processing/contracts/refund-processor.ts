import { PaymentProcessingContext, PaymentStageProcessingResult } from "../models";
import { PaymentProcessor } from "./payment-processor";

export interface RefundProcessor extends PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> {}
