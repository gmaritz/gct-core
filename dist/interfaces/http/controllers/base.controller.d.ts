import { Response } from "express";
import { ApiResponse } from "../dto/api-response";
import { PagedResponse } from "../dto/paged-response";
export declare class BaseController {
    protected createSuccessResponse<T>(data: T): ApiResponse<T>;
    protected createPagedResponse<T>(items: T[], page: number, pageSize: number, totalItems: number): PagedResponse<T>;
    protected ok<T>(response: Response, data: T): Response<ApiResponse<T>>;
}
//# sourceMappingURL=base.controller.d.ts.map