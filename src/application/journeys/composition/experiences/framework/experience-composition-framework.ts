import { JourneyExperience } from "../../../models";

import {
  ExperienceCompositionContext,
  ExperiencePriority,
  ExperienceSequence,
  ExperienceSource,
  ExperienceType,
} from "../models";

export interface ExperienceCompositionCandidate {
  readonly experienceId: string;
  readonly name: string;
  readonly source: ExperienceSource;
  readonly type: ExperienceType;
  readonly priority: ExperiencePriority;
  readonly sequence: ExperienceSequence;
}

export interface ExperienceCandidateProvider {
  resolve(
    context: ExperienceCompositionContext,
  ): Promise<ReadonlyArray<ExperienceCompositionCandidate>> | ReadonlyArray<ExperienceCompositionCandidate>;
}

const EMPTY_CANDIDATES: ReadonlyArray<ExperienceCompositionCandidate> = Object.freeze([]);

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function freezeExperience(experience: JourneyExperience): JourneyExperience {
  return Object.freeze({
    experienceId: experience.experienceId,
    name: experience.name,
    type: experience.type,
    sequence: experience.sequence ? Object.freeze({ ...experience.sequence }) : undefined,
  });
}

function compareBySequence(
  left: ExperienceCompositionCandidate,
  right: ExperienceCompositionCandidate,
): number {
  if (left.sequence.day !== right.sequence.day) {
    return left.sequence.day - right.sequence.day;
  }

  return left.sequence.order - right.sequence.order;
}

function toJourneyExperience(
  candidate: ExperienceCompositionCandidate,
): JourneyExperience | undefined {
  if (isBlank(candidate.experienceId) || isBlank(candidate.name)) {
    return undefined;
  }

  return freezeExperience({
    experienceId: candidate.experienceId,
    name: candidate.name,
    type: candidate.type,
    sequence: candidate.sequence,
  });
}

export class ExperienceCompositionFramework {
  public constructor(
    private readonly candidateProvider: ExperienceCandidateProvider = {
      resolve: (): ReadonlyArray<ExperienceCompositionCandidate> => EMPTY_CANDIDATES,
    },
  ) {}

  public async compose(
    context: ExperienceCompositionContext,
  ): Promise<ReadonlyArray<JourneyExperience>> {
    const candidates = await Promise.resolve(this.candidateProvider.resolve(context));

    const experiences = [...candidates]
      .sort(compareBySequence)
      .map(toJourneyExperience)
      .filter((experience): experience is JourneyExperience => typeof experience !== "undefined");

    return Object.freeze(experiences);
  }
}