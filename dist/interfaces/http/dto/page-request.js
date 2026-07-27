"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPageRequest = createPageRequest;
const api_constants_1 = require("../constants/api.constants");
function createPageRequest(input) {
    const page = input?.page && input.page > 0 ? input.page : 1;
    const pageSizeInput = input?.pageSize && input.pageSize > 0 ? input.pageSize : api_constants_1.DEFAULT_PAGE_SIZE;
    const pageSize = pageSizeInput > api_constants_1.MAX_PAGE_SIZE ? api_constants_1.MAX_PAGE_SIZE : pageSizeInput;
    return {
        page,
        pageSize,
    };
}
//# sourceMappingURL=page-request.js.map