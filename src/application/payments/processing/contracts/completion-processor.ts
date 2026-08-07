import { PaymentProcessingContext, PaymentStageProcessingResult } from "../models";
import { PaymentProcessor } from "./payment-processor";

export interface CompletionProcessor extends PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> {}
