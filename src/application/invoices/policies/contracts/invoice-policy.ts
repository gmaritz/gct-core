export interface InvoicePolicy<TContext, TResult> {
  evaluate(context: TContext): TResult;
}