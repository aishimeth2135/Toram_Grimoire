import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchProps, handleDisplayData } from './utils'
import type { HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function ProrationHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    condition: t('skill-query.branch.next.condition-default-value'),
    name: t('skill-query.branch.effect.base-name'),
  })

  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['caption'])
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    condition: value => value !== 'none',
  })

  return handleDisplayData(branchItem, props, {
    texts: textPropsMap.value,
    filters: filters.value,
  })
}
