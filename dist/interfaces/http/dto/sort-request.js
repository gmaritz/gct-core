"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSortRequest = createSortRequest;
const api_constants_1 = require("../constants/api.constants");
function createSortRequest(input) {
    return {
        sortBy: input?.sortBy,
        direction: input?.direction ?? api_constants_1.DEFAULT_SORT_DIRECTION,
    };
}
//# sourceMappingURL=sort-request.js.map