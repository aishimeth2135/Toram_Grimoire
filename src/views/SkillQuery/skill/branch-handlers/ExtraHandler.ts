import Grimoire from '@/shared/Grimoire'

import { SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap, HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputingContainer/compute'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { cloneBranchProps, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'
import type { HandleDisplayDataOptionFilters } from './utils'
import DisplayDataContainer from './utils/DisplayDataContainer'

export default function ExtraHandler<BranchItem extends SkillBranchItemSuffix>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const defaultCondition = branchItem.mainBranch.is(SkillBranchNames.Damage) ?
    t('skill-query.branch.damage: extra.condition-default-value') :
    t('skill-query.branch.global-suffix.extra.condition-default-value')
  const props = cloneBranchProps(branchItem, {
    condition: branchItem.prop('type') === 'normal' ?
      defaultCondition :
      t('skill-query.branch.global-suffix.extra.condition-next-default-value'),
  })

  const mainBranch = branchItem.mainBranch
  if (!mainBranch) {
    return new DisplayDataContainer({
      branchItem,
      containers: {},
      statContainers: [],
      value: {},
    })
  }
  const filters = new MapContainer<HandleDisplayDataOptionFilters>()
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>()
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>()
  const pureValues = []

  if (mainBranch.is(SkillBranchNames.Damage)) {
    pureValues.push('ailment_name')
    valuePropsMap.set('ailment_chance', '%')
    filters.set('ailment_name', value => !!value)

    filters.set('caption', value => !!value)
    filters.set('element', value => !!value)
    textPropsMap.append('caption', 'condition')
    pureValues.push('element')
  } else if (['effect', 'next', 'passive', 'heal'].includes(mainBranch.name)) {
    filters.set('caption', value => !!value)
    textPropsMap.append('caption', 'condition')
  }

  return handleDisplayData(branchItem, props, {
    values: valuePropsMap.value,
    texts: textPropsMap.value,
    filters: filters.value,
    pureValues,
  })
}
