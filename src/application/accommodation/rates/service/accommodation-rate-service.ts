import { ApplicationService } from "../../../application-service";
import { AccommodationProviderCapabilityType } from "../../capabilities";
import { AccommodationResultMetadata } from "../../results";
import { ProviderRegistry } from "../../registry";

import { AccommodationRate, AccommodationRateQuery, AccommodationRateResult } from "../models";
import { AccommodationRateValidator } from "../validation";

interface AccommodationRatesProvider {
  rates(query: AccommodationRateQuery): Promise<AccommodationRateResult>;
}

function hasRatesMethod(provider: unknown): provider is AccommodationRatesProvider {
  return typeof (provider as AccommodationRatesProvider | undefined)?.rates === "function";
}

function cloneRate(rate: AccommodationRate): AccommodationRate {
  return Object.freeze({ ...rate });
}

function cloneMetadata(metadata: AccommodationResultMetadata): AccommodationResultMetadata {
  return Object.freeze({
    provider: metadata.provider,
    generatedAt: new Date(metadata.generatedAt),
    version: metadata.version,
  });
}

function freezeRateResult(result: AccommodationRateResult): AccommodationRateResult {
  return Object.freeze({
    accommodationId: result.accommodationId,
    stayPeriod: Object.freeze({ ...result.stayPeriod }),
    occupancy: Object.freeze({ ...result.occupancy }),
    selectionStrategy: result.selectionStrategy,
    rates: Object.freeze(result.rates.map(cloneRate)),
    metadata: cloneMetadata(result.metadata),
  });
}

function createAggregatedMetadata(): AccommodationResultMetadata {
  return Object.freeze({
    generatedAt: new Date(),
    version: "1.0.0",
  });
}

export class AccommodationRateService
  implements ApplicationService<AccommodationRateQuery, AccommodationRateResult>
{
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly validator: AccommodationRateValidator = new AccommodationRateValidator(),
  ) {}

  public async execute(query: AccommodationRateQuery): Promise<AccommodationRateResult> {
    const validationResult = this.validator.validate(query);

    if (!validationResult.valid) {
      throw new Error(
        `Accommodation rate validation failed: ${validationResult.errors
          .map((error) => error.code)
          .join(", ")}`,
      );
    }

    const providers = this.providerRegistry.findProviders(AccommodationProviderCapabilityType.RATES);
    const providerResults = await Promise.allSettled(
      providers.map(async (provider) => {
        if (!hasRatesMethod(provider)) {
          throw new Error(`Provider does not implement rate retrieval: ${provider.providerId}`);
        }

        return provider.rates(query);
      }),
    );

    const successfulResults = providerResults
      .filter((providerResult): providerResult is PromiseFulfilledResult<AccommodationRateResult> =>
        providerResult.status === "fulfilled",
      )
      .map((providerResult) => providerResult.value);

    if (successfulResults.length === 0) {
      throw new Error("No accommodation rate providers returned rates");
    }

    const aggregatedRates = successfulResults.flatMap((rateResult) => rateResult.rates);
    const aggregatedResult: AccommodationRateResult = {
      accommodationId: query.identifier,
      stayPeriod: query.stayPeriod,
      occupancy: query.occupancy,
      selectionStrategy: query.selectionStrategy,
      rates: aggregatedRates,
      metadata: createAggregatedMetadata(),
    };

    return freezeRateResult(aggregatedResult);
  }
}