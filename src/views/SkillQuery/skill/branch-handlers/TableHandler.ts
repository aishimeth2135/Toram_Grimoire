import { splitComma } from '@/shared/utils/string'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillBranchItemSuffix,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputingContainer'
import { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function TableHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const labels = splitComma(branchItem.prop('labels'))
  const rows = branchItem.suffixBranches
    .filter(suf => suf.is(SkillBranchNames.Row))
    .map(suf => RowHandler(computing, suf, labels.length))
  return {
    labels,
    rows,
  }
}

function RowHandler<BranchItem extends SkillBranchItemSuffix>(
  computing: SkillComputingContainer,
  branchItem: BranchItem,
  cellsLength: number
) {
  const attrs = cloneBranchProps(branchItem)
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>()
  textPropsMap.appendIterable('cell', cellsLength)

  return handleDisplayData(computing, branchItem, attrs, {
    texts: textPropsMap.value,
  })
}
