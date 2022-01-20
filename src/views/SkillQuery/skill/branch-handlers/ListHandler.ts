import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import TextHandler from './TextHandler'

export default function ListHandler(branchItem: SkillBranchItem) {
  const suffixList = branchItem.suffixBranches
    .filter(suf => suf.name === 'list')
    .map(suf => TextHandler(suf))
  return [
    TextHandler(branchItem),
    ...suffixList,
  ]
}

