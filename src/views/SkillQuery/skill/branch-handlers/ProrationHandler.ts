import SkillComputingContainer, { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { cloneBranchProps, handleDisplayData } from './utils'
import type { HandleBranchLangPropsMap } from './utils'
import MapContainer from './utils/MapContainer'

export default function ProrationHandler<BranchItem extends SkillBranchItemBaseChilds>(computing: SkillComputingContainer, branchItem: BranchItem) {
  const props = cloneBranchProps(branchItem)
  if (props.get('proration') === 'auto') {
    props.set('proration', props.get('damage')!)
  }
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>({
    'damage': { rootKey: SkillBranchNames.Proration },
    'proration': { rootKey: SkillBranchNames.Proration },
  })
  const titles = ['damage', 'proration']

  return handleDisplayData(computing, branchItem, props, {
    langs: langAttrsMap.value,
    titles,
  })
}
