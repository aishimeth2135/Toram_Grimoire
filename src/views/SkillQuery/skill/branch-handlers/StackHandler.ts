import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import { type HandleDisplayDataOptionFilters, cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function StackHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const idx = branchItem.parent.branchItems
    .filter(item => item.is(SkillBranchNames.Stack))
    .indexOf(branchItem)
  const props = cloneBranchProps(branchItem, {
    name: value =>
      value === 'auto' ? t('skill-query.branch.stack.base-name') + (idx + 1).toString() : value,
  })

  if (props.get('default') === 'auto') {
    props.set('default', props.get('min')!)
  }
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    max: value => !!value,
  })
  const pureValues = ['min', 'max', 'default', 'step']
  const pureDatas = ['name', 'unit']

  const displayData = handleDisplayData(computing, branchItem, props, {
    filters: filters.value,
    pureValues,
    pureDatas,
  })

  const tmpv = toInt(displayData.get('max') || displayData.get('default'))
  if (tmpv !== null && tmpv > 999) {
    displayData.setCustomData('stackInputWidth', '3rem')
  }

  return displayData
}
