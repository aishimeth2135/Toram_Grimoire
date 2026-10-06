import { ResultContainerTypes } from '../../common/ResultContainer'
import { SkillBranchResult } from '../SkillComputing/SkillBranchResult'
import {
  type ComputedBranchHelperResult,
  computeBranchValue,
  initializeBranchFormulaResult,
} from './Formula'

export function createNumberPropertyResult(
  helper: ComputedBranchHelperResult,
  propertyKey: string,
  value: string
): SkillBranchResult {
  const result = SkillBranchResult.create(
    ResultContainerTypes.Number,
    helper.branchItem,
    propertyKey,
    value,
    computeBranchValue(value, helper)
  )
  initializeBranchFormulaResult(result, helper)
  return result
}
