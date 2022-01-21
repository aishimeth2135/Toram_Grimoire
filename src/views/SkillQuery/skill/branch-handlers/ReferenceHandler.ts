import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchAttrs, handleDisplayData, HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function ReferenceHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const attrs = cloneBranchAttrs(branchItem)

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    text: value => !!value,
  })
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['text'])

  const pureDatas = ['url', 'url_text']

  return handleDisplayData(branchItem, attrs, {
    filters: filters.value,
    texts: textAttrsMap.value,
    pureDatas,
  })
}
