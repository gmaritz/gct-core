export type SortDirection = "asc" | "desc";
export interface SortRequest {
    sortBy?: string;
    direction: SortDirection;
}
export declare function createSortRequest(input?: Partial<SortRequest>): SortRequest;
//# sourceMappingURL=sort-request.d.ts.map