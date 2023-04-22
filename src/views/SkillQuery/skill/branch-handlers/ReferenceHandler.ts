import {
  SkillBranchItem,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import {
  HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function ReferenceHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const props = cloneBranchProps(branchItem)

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    text: value => !!value,
  })
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['text'])

  const pureDatas = ['url', 'url_text']

  return handleDisplayData(computing, branchItem, props, {
    filters: filters.value,
    texts: textPropsMap.value,
    pureDatas,
  })
}
