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

export class CustomerEmailConflictError extends Error {
  public constructor() {
    super("A customer with this email already exists.");
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validInput(input: CustomerResolutionInput): input is Required<CustomerResolutionInput> {
  return Boolean(
    input.email
    && isValidEmail(normalizeEmail(input.email))
    && input.firstName?.trim()
    && input.lastName?.trim(),
  );
}

export class CustomerResolutionService {
  public constructor(private readonly repository: CustomerResolutionRepository) {}

  public async resolveOrCreate(input: CustomerResolutionInput): Promise<ResolvedCustomer> {
    if (!validInput(input)) throw new Error("Valid customer contact information is required.");

    const normalized = normalizeEmail(input.email);
    const existing = await this.repository.findByNormalizedEmail(normalized);
    if (existing) return existing;

    const customer = {
      email: normalized,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() ?? "",
    };
    try {
      return await this.repository.createAnonymousCustomer(customer);
    } catch (error) {
      if (!(error instanceof CustomerEmailConflictError)) throw error;
      const concurrent = await this.repository.findByNormalizedEmail(normalized);
      if (concurrent) return concurrent;
      throw error;
    }
  }
}