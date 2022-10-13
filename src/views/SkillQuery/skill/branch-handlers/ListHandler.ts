import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import SkillComputingContainer, {
  SkillBranchItem,
} from '@/lib/Skill/SkillComputingContainer'

import TextHandler from './TextHandler'

export default function ListHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const suffixList = branchItem.suffixBranches
    .filter(suf => suf.is(SkillBranchNames.List))
    .map(suf => TextHandler(computing, suf))
  return [TextHandler(computing, branchItem), ...suffixList]
}
