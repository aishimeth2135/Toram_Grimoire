import Grimoire from '@/shared/Grimoire'

import { SkillBranchNames } from '@/lib/Skill/Skill/enums'
import SkillComputingContainer, {
  SkillBranchItemSuffix,
} from '@/lib/Skill/SkillComputingContainer'
import type {
  HandleBranchTextPropsMap,
  HandleBranchValuePropsMap,
} from '@/lib/Skill/SkillComputingContainer/compute'

import {
  HandleBranchLangPropsMap,
  HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import DisplayDataContainer from './handle/DisplayDataContainer'
import MapContainer from './handle/MapContainer'

export default function ExtraHandler<BranchItem extends SkillBranchItemSuffix>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const defaultCondition =
    branchItem.mainBranch.is(SkillBranchNames.Damage) &&
    branchItem.stats.length > 0
      ? t('skill-query.branch.damage: extra.condition-default-value')
      : t('skill-query.branch.global-suffix.extra.condition-default-value')
  const props = cloneBranchProps(branchItem, {
    condition:
      branchItem.prop('type') === 'normal'
        ? defaultCondition
        : t(
            'skill-query.branch.global-suffix.extra.condition-next-default-value'
          ),
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
  const langPropsMap = new MapContainer<HandleBranchLangPropsMap>()
  const pureValues = []

  if (mainBranch.is(SkillBranchNames.Damage)) {
    pureValues.push('ailment_name')
    valuePropsMap.set('ailment_chance', '%')
    filters.set('ailment_name', value => !!value)

    filters.set('caption', value => !!value)
    filters.set('element', value => !!value)
    textPropsMap.append('caption', 'condition')
    pureValues.push('element')

    filters.set('dual_element', value => !!value)
    langPropsMap.set('dual_element', { rootKey: SkillBranchNames.Damage })
  } else if (['effect', 'next', 'passive', 'heal'].includes(mainBranch.name)) {
    filters.set('caption', value => !!value)
    textPropsMap.append('caption', 'condition')
  }

  return handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    texts: textPropsMap.value,
    filters: filters.value,
    langs: langPropsMap.value,
    pureValues,
  })
}
