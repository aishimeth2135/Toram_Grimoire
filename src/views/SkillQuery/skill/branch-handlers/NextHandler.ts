import Grimoire from '@/shared/Grimoire'

import SkillComputingContainer, {
  SkillBranchItem,
} from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import {
  HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function ProrationHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    condition: t('skill-query.branch.next.condition-default-value'),
    name: t('skill-query.branch.effect.base-name'),
  })

  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['caption'])
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    condition: value => value !== 'none',
  })

  return handleDisplayData(computing, branchItem, props, {
    texts: textPropsMap.value,
    filters: filters.value,
  })
}
