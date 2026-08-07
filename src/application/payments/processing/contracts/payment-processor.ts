export interface PaymentProcessor<TContext, TResult> {
  process(context: TContext): TResult;
}
