import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants/api.constants";

export interface PageRequest {
	page: number;
	pageSize: number;
}

export function createPageRequest(input?: Partial<PageRequest>): PageRequest {
	const page = input?.page && input.page > 0 ? input.page : 1;
	const pageSizeInput = input?.pageSize && input.pageSize > 0 ? input.pageSize : DEFAULT_PAGE_SIZE;
	const pageSize = pageSizeInput > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : pageSizeInput;

	return {
		page,
		pageSize,
	};
}
