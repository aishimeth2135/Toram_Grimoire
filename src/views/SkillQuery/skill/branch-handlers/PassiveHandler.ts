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
