export interface JourneyPolicy<TContext, TResult> {
  evaluate(context: TContext): TResult;
}