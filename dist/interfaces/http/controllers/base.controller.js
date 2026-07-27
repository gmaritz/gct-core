"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    createSuccessResponse(data) {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        };
    }
    createPagedResponse(items, page, pageSize, totalItems) {
        const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
        return {
            items,
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }
    ok(response, data) {
        return response.status(200).json(this.createSuccessResponse(data));
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=base.controller.js.map