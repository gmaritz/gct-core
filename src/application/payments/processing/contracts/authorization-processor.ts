import { PaymentProcessingContext, PaymentStageProcessingResult } from "../models";
import { PaymentProcessor } from "./payment-processor";

export interface AuthorizationProcessor extends PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> {}
