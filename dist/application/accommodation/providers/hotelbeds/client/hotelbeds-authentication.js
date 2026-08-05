"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsAuthentication = void 0;
class DefaultHotelbedsAuthentication {
    prepareHeaders(request) {
        return Object.freeze({
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-GCT-Provider": "hotelbeds-placeholder",
            "X-GCT-Operation": request.operation,
        });
    }
}
exports.DefaultHotelbedsAuthentication = DefaultHotelbedsAuthentication;
//# sourceMappingURL=hotelbeds-authentication.js.map