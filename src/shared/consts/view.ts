export const ViewNames = {
  CharacterSimulator: 0,
  RegistletQuery: 1,
} as const
export type ViewNames = (typeof ViewNames)[keyof typeof ViewNames]
