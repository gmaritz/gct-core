import { PaymentProcessingContext, PaymentStageProcessingResult } from "../models";
import { PaymentProcessor } from "./payment-processor";

export interface CaptureProcessor extends PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> {}
