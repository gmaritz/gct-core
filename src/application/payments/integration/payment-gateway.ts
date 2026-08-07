import { PaymentProviderContext } from "./models";
import { PaymentGatewayResult } from "./models";

export interface PaymentGateway {
  execute(context: PaymentProviderContext): Promise<PaymentGatewayResult>;
}
