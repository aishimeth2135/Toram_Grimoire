const enum StatTypes {
  Constant = 'constant',
  Multiplier = 'multiplier',
  Total = 'total',
}

type StatNormalTypes = StatTypes.Constant | StatTypes.Multiplier

export { StatTypes }
export type { StatNormalTypes }
