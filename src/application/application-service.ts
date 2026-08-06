export interface ApplicationService<TQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}