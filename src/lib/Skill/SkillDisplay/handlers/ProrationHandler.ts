import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  type SkillBranchItemBaseChilds,
  SkillComputingContainer,
  resolveProrationValue,
} from '@/lib/Skill/SkillComputing'

import { type HandleBranchLangPropsMap, cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function ProrationHandler<BranchItem extends SkillBranchItemBaseChilds>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const props = cloneBranchProps(branchItem)
  props.set('proration', resolveProrationValue(props))
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>({
    damage: { rootKey: SkillBranchNames.Proration },
    proration: { rootKey: SkillBranchNames.Proration },
  })
  const titles = ['damage', 'proration']

  return handleDisplayData(computing, branchItem, props, {
    langs: langAttrsMap.value,
    titles,
    sources:
      branchItem.prop('proration') === 'auto'
        ? {
            proration: [
              { branch: branchItem, key: 'proration' },
              { branch: branchItem, key: 'damage' },
            ],
          }
        : {},
  })
}
