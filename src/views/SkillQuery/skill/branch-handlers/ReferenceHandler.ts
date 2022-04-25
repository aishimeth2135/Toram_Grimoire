import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchProps, handleDisplayData, HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function ReferenceHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const props = cloneBranchProps(branchItem)

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    text: value => !!value,
  })
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['text'])

  const pureDatas = ['url', 'url_text']

  return handleDisplayData(branchItem, props, {
    filters: filters.value,
    texts: textPropsMap.value,
    pureDatas,
  })
}
