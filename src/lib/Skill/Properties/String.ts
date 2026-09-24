import { ResultContainerTypes } from '../../common/ResultContainer'
import type { SkillBranchItemBaseChilds } from '../SkillComputing/SkillBranchItem'
import { SkillBranchResult } from '../SkillComputing/SkillBranchResult'

export function createStringPropertyResult(
  branchItem: SkillBranchItemBaseChilds,
  propertyKey: string,
  value: string
): SkillBranchResult {
  return SkillBranchResult.create(
    ResultContainerTypes.String,
    branchItem,
    propertyKey,
    value,
    value
  )
}
