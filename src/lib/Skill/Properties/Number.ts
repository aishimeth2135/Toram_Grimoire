import { ResultContainerTypes } from '../../common/ResultContainer'
import { SkillBranchResult } from '../SkillComputing/SkillBranchResult'
import { type ComputedBranchHelperResult, computeBranchValue } from './Formula'

export function createNumberPropertyResult(
  helper: ComputedBranchHelperResult,
  propertyKey: string,
  value: string
): SkillBranchResult {
  return SkillBranchResult.create(
    ResultContainerTypes.Number,
    helper.branchItem,
    propertyKey,
    value,
    computeBranchValue(value, helper)
  )
}
