import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import TextHandler from './TextHandler'

export default function ListHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const suffixList = branchItem.suffixBranches
    .filter(suf => suf.is(SkillBranchNames.List))
    .map(suf => TextHandler(suf))
  return [
    TextHandler(branchItem),
    ...suffixList,
  ]
}

