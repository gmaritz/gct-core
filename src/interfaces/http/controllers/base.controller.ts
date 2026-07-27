import { Response } from "express";

import { ApiResponse } from "../dto/api-response";
import { PagedResponse } from "../dto/paged-response";

export class BaseController {
	protected createSuccessResponse<T>(data: T): ApiResponse<T> {
		return {
			success: true,
			data,
			timestamp: new Date().toISOString(),
		};
	}

	protected createPagedResponse<T>(
		items: T[],
		page: number,
		pageSize: number,
		totalItems: number,
	): PagedResponse<T> {
		const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

		return {
			items,
			page,
			pageSize,
			totalItems,
			totalPages,
		};
	}

	protected ok<T>(response: Response, data: T): Response<ApiResponse<T>> {
		return response.status(200).json(this.createSuccessResponse(data));
	}
}
