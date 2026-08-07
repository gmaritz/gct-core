import { PaymentProcessingContext, PaymentStageProcessingResult } from "../models";
import { PaymentProcessor } from "./payment-processor";

export interface SettlementProcessor extends PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult> {}
