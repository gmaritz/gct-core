"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResolutionService = exports.CustomerEmailConflictError = void 0;
class CustomerEmailConflictError extends Error {
    constructor() {
        super("A customer with this email already exists.");
    }
}
exports.CustomerEmailConflictError = CustomerEmailConflictError;
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validInput(input) {
    return Boolean(input.email
        && isValidEmail(normalizeEmail(input.email))
        && input.firstName?.trim()
        && input.lastName?.trim());
}
class CustomerResolutionService {
    constructor(repository) {
        this.repository = repository;
    }
    async resolveOrCreate(input) {
        if (!validInput(input))
            throw new Error("Valid customer contact information is required.");
        const normalized = normalizeEmail(input.email);
        const existing = await this.repository.findByNormalizedEmail(normalized);
        if (existing)
            return existing;
        const customer = {
            email: normalized,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            phone: input.phone?.trim() ?? "",
        };
        try {
            return await this.repository.createAnonymousCustomer(customer);
        }
        catch (error) {
            if (!(error instanceof CustomerEmailConflictError))
                throw error;
            const concurrent = await this.repository.findByNormalizedEmail(normalized);
            if (concurrent)
                return concurrent;
            throw error;
        }
    }
}
exports.CustomerResolutionService = CustomerResolutionService;
//# sourceMappingURL=customer-resolution-service.js.map