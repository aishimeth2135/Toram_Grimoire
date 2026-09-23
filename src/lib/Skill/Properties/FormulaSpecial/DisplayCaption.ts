import type { SkillBranchStatResult } from '../../SkillComputing/SkillBranchResult'
import type { ComputedBranchHelperResult } from '../Formula'
import { computeTextProperty } from '../Text'

interface StatDisplayCaptionFormulaScope {
  $value: number
}

export function computeStatDisplayCaption(
  helper: ComputedBranchHelperResult,
  result: SkillBranchStatResult,
  propertyKey: string,
  propertyValue: string
) {
  const value = Number(result.result)
  const scope: StatDisplayCaptionFormulaScope = {
    $value: Number.isFinite(value) ? value : 0,
  }
  return computeTextProperty(
    { ...helper, vars: { ...helper.vars, ...scope } },
    propertyKey,
    propertyValue
  )
}
