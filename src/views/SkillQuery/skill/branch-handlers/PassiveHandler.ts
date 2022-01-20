import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchAttrs, handleDisplayData, HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function PassiveHandler(branchItem: SkillBranchItem) {
  const { t } = Grimoire.i18n

  const attrs = cloneBranchAttrs(branchItem, {
    name: t('skill-query.branch.passive.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    caption: value => !!value,
  })

  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['caption'])

  const pureDatas = ['name']

  return handleDisplayData(branchItem, attrs, {
    texts: textAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })
}
