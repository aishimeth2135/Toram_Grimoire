export const enum StatTypes {
  Constant = 'constant',
  Multiplier = 'multiplier',
  Total = 'total',
}

export type StatNormalTypes = StatTypes.Constant | StatTypes.Multiplier

export const enum StatValueSourceTypes {
  Skill = 'skill',
  Equipment = 'equipment',
  Crystal = 'crystal',
  Food = 'food',
  Registlet = 'registlet',
  Potion = 'potion',
}
