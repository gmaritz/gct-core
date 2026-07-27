import { DEFAULT_SORT_DIRECTION } from "../constants/api.constants";

export type SortDirection = "asc" | "desc";

export interface SortRequest {
	sortBy?: string;
	direction: SortDirection;
}

export function createSortRequest(input?: Partial<SortRequest>): SortRequest {
	return {
		sortBy: input?.sortBy,
		direction: input?.direction ?? DEFAULT_SORT_DIRECTION,
	};
}
