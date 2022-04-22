
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { SkillBranchItem, SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'
import { HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchAttrs, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'

export default function TableHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const labels = branchItem.attr('labels').split(/\s*,\s*/)
  const rows = branchItem.suffixBranches
    .filter(suf => suf.is(SkillBranchNames.Row))
    .map(suf => RowHandler(suf, labels.length))
  return {
    labels,
    rows,
  }
}

function RowHandler<BranchItem extends SkillBranchItemSuffix>(branchItem: BranchItem, cellsLength: number) {
  const attrs = cloneBranchAttrs(branchItem)
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>()
  textAttrsMap.appendIterable('cell', cellsLength)

  return handleDisplayData(branchItem, attrs, {
    texts: textAttrsMap.value,
  })
}
