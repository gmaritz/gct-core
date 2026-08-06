export interface ExperienceSequence {
  readonly day: number;
  readonly order: number;
  readonly itineraryLabel?: string;
}

export function createExperienceSequence(sequence: ExperienceSequence): ExperienceSequence {
  return Object.freeze({
    day: sequence.day,
    order: sequence.order,
    itineraryLabel: sequence.itineraryLabel,
  });
}