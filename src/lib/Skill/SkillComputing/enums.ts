export const FormulaDisplayModes = {
  Normal: 'normal',
  OriginalFormula: 'original-formula',
} as const
export type FormulaDisplayModes = (typeof FormulaDisplayModes)[keyof typeof FormulaDisplayModes]

export const SkillBuffs = {
  MpCostHalf: 'mp_cost_half',
} as const
export type SkillBuffs = (typeof SkillBuffs)[keyof typeof SkillBuffs]
