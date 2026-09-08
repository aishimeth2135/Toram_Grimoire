const EnchantDollBaseTypes = {
  Physical: 'physical',
  Magic: 'magic',
  None: 'none',
} as const
type EnchantDollBaseTypes = (typeof EnchantDollBaseTypes)[keyof typeof EnchantDollBaseTypes]

const AutoFindNegaitveStatsTypes = {
  SuccessRate: 'success-rate',
  Material: 'material',
} as const
type AutoFindNegaitveStatsTypes = (typeof AutoFindNegaitveStatsTypes)[keyof typeof AutoFindNegaitveStatsTypes]

export { EnchantDollBaseTypes, AutoFindNegaitveStatsTypes }
