import { SkillBranchItem, SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'

import { cloneBranchAttrs, handleDisplayData } from './utils'
import type { HandleBranchLangAttrsMap } from './utils'
import MapContainer from './utils/MapContainer'

export default function ProrationHandler(branchItem: SkillBranchItem | SkillBranchItemSuffix) {
  const attrs = cloneBranchAttrs(branchItem)
  if (attrs['proration'] === 'auto') {
    attrs['proration'] = attrs['damage']
  }
  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['damage', 'proration'])
  const titles = ['damage', 'proration']

  return handleDisplayData(branchItem, attrs, {
    langs: langAttrsMap.value,
    titles,
  })
}
