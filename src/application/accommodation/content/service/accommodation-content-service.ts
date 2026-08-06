import { AccommodationContentResult } from "../../results";
import { ProviderRegistry } from "../../registry";
import { AccommodationProviderCapabilityType } from "../../capabilities";

import { AccommodationContentQuery } from "../models";
import { AccommodationContentIdentifier } from "../models/accommodation-content-identifier";
import { AccommodationContentRequest } from "../models/accommodation-content-request";
import { AccommodationContentValidator } from "../validation";

interface AccommodationContentProvider {
  content(identifier: AccommodationContentIdentifier): Promise<AccommodationContentResult>;
}

function hasContentMethod(
  provider: unknown,
): provider is ProviderRegistry extends { resolveAll(): ReadonlyArray<infer T> } ? T & AccommodationContentProvider : AccommodationContentProvider {
  return typeof (provider as AccommodationContentProvider | undefined)?.content === "function";
}

function createRequest(query: AccommodationContentQuery): AccommodationContentRequest {
  return Object.freeze({
    identifier: query.identifier,
    context: query.context,
  });
}

export class AccommodationContentService {
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly validator: AccommodationContentValidator = new AccommodationContentValidator(),
  ) {}

  public async execute(query: AccommodationContentQuery): Promise<AccommodationContentResult> {
    const request = createRequest(query);
    const validationResult = this.validator.validate(request);

    if (!validationResult.valid) {
      throw new Error(
        `Accommodation content validation failed: ${validationResult.errors
          .map((error) => error.code)
          .join(", ")}`,
      );
    }

    const providers = this.providerRegistry.findProviders(AccommodationProviderCapabilityType.CONTENT);
    const providerResults = await Promise.allSettled(
      providers.map(async (provider) => {
        if (!hasContentMethod(provider)) {
          throw new Error(`Provider does not implement content retrieval: ${provider.providerId}`);
        }

        return provider.content(request.identifier);
      }),
    );

    const successfulResults = providerResults
      .filter((providerResult): providerResult is PromiseFulfilledResult<AccommodationContentResult> =>
        providerResult.status === "fulfilled",
      )
      .map((providerResult) => providerResult.value);

    if (successfulResults.length === 0) {
      throw new Error("No accommodation content providers returned content");
    }

    return successfulResults[0]!;
  }

  public async getContent(query: AccommodationContentQuery): Promise<AccommodationContentResult> {
    return this.execute(query);
  }

  public async content(query: AccommodationContentQuery): Promise<AccommodationContentResult> {
    return this.execute(query);
  }
}