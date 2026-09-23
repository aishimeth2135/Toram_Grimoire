import {
  SkillBranchTextResult,
  type SkillBranchTextResultParseResult,
} from '../SkillComputing/SkillBranchResult'
import { type ComputedBranchHelperResult, computeBranchValue } from './Formula'

export function computeTextProperty(
  helper: ComputedBranchHelperResult,
  propertyKey: string,
  propertyValue: string | undefined
): SkillBranchTextResult {
  if (propertyValue === undefined) {
    const parseResult: SkillBranchTextResultParseResult = {
      containers: [],
      parts: [''],
    }
    const result = SkillBranchTextResult.createForBranch(
      helper.branchItem,
      propertyKey,
      '0',
      '0',
      parseResult
    )
    result.markEmpty()
    return result
  }

  const parseResult = SkillBranchTextResult.parse(
    helper.branchItem,
    propertyKey,
    propertyValue,
    value => computeBranchValue(value, helper)
  )
  return SkillBranchTextResult.createForBranch(
    helper.branchItem,
    propertyKey,
    propertyValue,
    propertyValue,
    parseResult
  )
}
