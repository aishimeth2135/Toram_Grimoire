import { computeFormula } from '@/shared/utils/data'

import type { SkillBranchItemBaseChilds } from '../../SkillComputing/SkillBranchItem'
import type { SkillBranchStatResult } from '../../SkillComputing/SkillBranchResult'

export interface StatConditionFormulaScope {
  $skill: {
    id: string
    range: number
  }
  $self: {
    id: string
  }
  $branch: {
    id: number
    prop: (key: string) => string
  }
}

export function attachStatConditionFormula(
  result: SkillBranchStatResult,
  branchItem: SkillBranchItemBaseChilds,
  properties: ReadonlyMap<string, string>
): void {
  const formula = properties.get(branchItem.propKey(result.key, 'conditionValue'))
  if (formula !== undefined) {
    result.setConditionValue(formula)
  }
}

export function computeStatConditionFormula(
  formula: string,
  scope: StatConditionFormulaScope
): boolean {
  return computeFormula(formula, scope, false) === true
}
