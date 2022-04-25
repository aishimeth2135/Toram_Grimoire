
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import { SkillBranchItem, SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'
import { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchProps, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'

export default function TableHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const labels = branchItem.prop('labels').split(/\s*,\s*/)
  const rows = branchItem.suffixBranches
    .filter(suf => suf.is(SkillBranchNames.Row))
    .map(suf => RowHandler(suf, labels.length))
  return {
    labels,
    rows,
  }
}

function RowHandler<BranchItem extends SkillBranchItemSuffix>(branchItem: BranchItem, cellsLength: number) {
  const attrs = cloneBranchProps(branchItem)
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>()
  textPropsMap.appendIterable('cell', cellsLength)

  return handleDisplayData(branchItem, attrs, {
    texts: textPropsMap.value,
  })
}
