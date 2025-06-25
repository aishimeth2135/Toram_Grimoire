import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import type { HandleBranchTextPropsMap } from '@/lib/Skill/SkillComputing/compute'

import { type HandleDisplayDataOptionFilters, cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function PassiveHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.passive.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    caption: value => !!value,
  })

  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['caption'])

  const pureDatas = ['name']

  return handleDisplayData(computing, branchItem, props, {
    texts: textPropsMap.value,
    filters: filters.value,
    pureDatas,
  })
}
