export const StatTypes = {
  Constant: 'constant',
  Multiplier: 'multiplier',
  Total: 'total',
} as const
export type StatTypes = (typeof StatTypes)[keyof typeof StatTypes]

export type StatNormalTypes = typeof StatTypes.Constant | typeof StatTypes.Multiplier

export const StatValueSourceTypes = {
  Skill: 'skill',
  Equipment: 'equipment',
  Crystal: 'crystal',
  Food: 'food',
  Registlet: 'registlet',
  Potion: 'potion',
  Trait: 'trait',
} as const
export type StatValueSourceTypes = (typeof StatValueSourceTypes)[keyof typeof StatValueSourceTypes]
