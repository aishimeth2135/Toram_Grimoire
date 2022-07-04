import { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'

import { cloneBranchProps, handleDisplayData } from './utils'
import type { HandleBranchLangPropsMap } from './utils'
import MapContainer from './utils/MapContainer'

export default function ProrationHandler<BranchItem extends SkillBranchItemBaseChilds>(branchItem: BranchItem) {
  const props = cloneBranchProps(branchItem)
  if (props.get('proration') === 'auto') {
    props.set('proration', props.get('damage')!)
  }
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>(['damage', 'proration'])
  const titles = ['damage', 'proration']

  return handleDisplayData(branchItem, props, {
    langs: langAttrsMap.value,
    titles,
  })
}
