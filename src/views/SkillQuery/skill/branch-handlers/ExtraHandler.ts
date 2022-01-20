import Grimoire from '@/shared/Grimoire'

import { SkillBranchItemSuffix } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextAttrsMap, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchAttrs, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'
import type { HandleDisplayDataOptionFilters } from './utils'
import DisplayDataContainer from './utils/DisplayDataContainer'

export default function ExtraHandler(branchItem: SkillBranchItemSuffix) {
  const { t } = Grimoire.i18n

  const attrs = cloneBranchAttrs(branchItem, {
    condition: branchItem.attr('type') === 'normal' ?
      t('skill-query.branch.global-suffix.extra.condition-default-value') :
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
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>()
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>()
  const pureValues = []

  if (mainBranch.name === 'damage') {
    pureValues.push('ailment_name')
    valueAttrsMap.set('ailment_chance', '%')
    filters.set('ailment_name', value => !!value)

    filters.set('caption', value => !!value)
    filters.set('element', value => !!value)
    textAttrsMap.append('caption', 'condition')
    pureValues.push('element')
  } else if (['effect', 'next', 'passive', 'heal'].includes(mainBranch.name)) {
    filters.set('caption', value => !!value)
    textAttrsMap.append('caption', 'condition')
  }

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    texts: textAttrsMap.value,
    filters: filters.value,
    pureValues,
  })
}
