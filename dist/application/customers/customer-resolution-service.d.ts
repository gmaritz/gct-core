export interface CustomerResolutionInput {
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone?: string;
}
export interface ResolvedCustomer {
    readonly customerId: string;
}
export interface CustomerResolutionRepository {
    findByNormalizedEmail(email: string): Promise<ResolvedCustomer | null>;
    createAnonymousCustomer(input: Required<CustomerResolutionInput>): Promise<ResolvedCustomer>;
}
export declare class CustomerEmailConflictError extends Error {
    constructor();
}
export declare class CustomerResolutionService {
    private readonly repository;
    constructor(repository: CustomerResolutionRepository);
    resolveOrCreate(input: CustomerResolutionInput): Promise<ResolvedCustomer>;
}
//# sourceMappingURL=customer-resolution-service.d.ts.map