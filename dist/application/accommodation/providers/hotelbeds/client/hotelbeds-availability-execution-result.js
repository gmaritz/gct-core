"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelbedsAvailabilityExecutionResult = createHotelbedsAvailabilityExecutionResult;
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
function freezeRequest(request) {
    return Object.freeze({
        ...request,
        body: request.body
            ? Object.freeze({
                ...request.body,
                stay: Object.freeze({ ...request.body.stay }),
                occupancies: Object.freeze(request.body.occupancies.map((occupancy) => Object.freeze({
                    ...occupancy,
                    paxes: Object.freeze(occupancy.paxes.map((pax) => Object.freeze({ ...pax }))),
                }))),
                hotels: Object.freeze({ hotel: Object.freeze([...request.body.hotels.hotel]) }),
            })
            : request.body,
    });
}
function freezeSupplierError(supplierError) {
    if (!supplierError) {
        return undefined;
    }
    return Object.freeze({
        code: supplierError.code,
        message: supplierError.message,
        payload: supplierError.payload,
    });
}
function createHotelbedsAvailabilityExecutionResult(result) {
    return Object.freeze({
        provider: "hotelbeds",
        operation: "availability",
        completedAt: new Date(result.completedAt.getTime()),
        responses: Object.freeze(result.responses.map((response) => Object.freeze({
            requestIndex: response.requestIndex,
            request: freezeRequest(response.request),
            success: response.success,
            retryable: response.retryable,
            attempts: response.attempts,
            httpStatus: response.httpStatus,
            headers: response.headers ? Object.freeze({ ...response.headers }) : undefined,
            body: response.body,
            supplierError: freezeSupplierError(response.supplierError),
            transportFailure: response.transportFailure
                ? Object.freeze({ ...response.transportFailure })
                : undefined,
            errors: Object.freeze((response.errors ?? []).map(hotelbeds_integration_error_1.createHotelbedsIntegrationError)),
        }))),
    });
}
//# sourceMappingURL=hotelbeds-availability-execution-result.js.map