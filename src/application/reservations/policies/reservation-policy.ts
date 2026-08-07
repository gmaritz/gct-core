export interface ReservationPolicy<TContext, TResult> {
  evaluate(context: TContext): TResult;
}
