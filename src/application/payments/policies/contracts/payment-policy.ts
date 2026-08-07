export interface PaymentPolicy<TContext, TResult> {
  evaluate(context: TContext): TResult;
}
