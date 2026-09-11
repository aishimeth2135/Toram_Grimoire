export const ViewNames = {
  CharacterSimulator: 0,
  RegistletQuery: 1,
  ItemQuery: 2,
} as const
export type ViewNames = (typeof ViewNames)[keyof typeof ViewNames]
