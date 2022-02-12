import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import { cloneBranchAttrs, handleDisplayData } from './utils'

export default function StackHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const idx = branchItem.parent.branchItems
    .filter(item => item.name === 'stack')
    .indexOf(branchItem)
  const attrs = cloneBranchAttrs(branchItem, {
    name: value => value === 'auto' ? t('skill-query.branch.stack.base-name') + (idx + 1).toString() : value,
  })

  if (attrs['default'] === 'auto') {
    attrs['default'] = attrs['min']
  }
  const pureValues = ['min', 'max', 'default']
  const pureDatas = ['name']

  const displayData = handleDisplayData(branchItem, attrs, {
    pureValues,
    pureDatas,
  })

  const tmpv = parseInt(displayData.get('max') || displayData.get('default'), 10)
  if (!Number.isNaN(tmpv) && tmpv > 999) {
    displayData.setCustomData('stackInputWidth', '3rem')
  }

  return displayData
}
