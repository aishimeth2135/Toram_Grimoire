import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  type SkillBranchItemBaseChilds,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'

import {
  type HandleBranchLangPropsMap,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function ProrationHandler<
  BranchItem extends SkillBranchItemBaseChilds,
>(computing: SkillComputingContainer, branchItem: BranchItem) {
  const props = cloneBranchProps(branchItem)
  if (props.get('proration') === 'auto') {
    props.set('proration', props.get('damage')!)
  }
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>({
    damage: { rootKey: SkillBranchNames.Proration },
    proration: { rootKey: SkillBranchNames.Proration },
  })
  const titles = ['damage', 'proration']

  return handleDisplayData(computing, branchItem, props, {
    langs: langAttrsMap.value,
    titles,
  })
}
