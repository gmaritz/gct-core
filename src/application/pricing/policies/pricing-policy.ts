export interface PricingPolicy<TContext, TResult> {
  evaluate(context: TContext): TResult;
}
