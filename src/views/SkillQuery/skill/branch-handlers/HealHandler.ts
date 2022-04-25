import { isNumberString } from '@/shared/utils/string'
import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { computeBranchValue, computedBranchHelper, HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchProps, handleDisplayData, numberStringToPercentage } from './utils'
import MapContainer from './utils/MapContainer'
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils'

export default function HealHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.heal.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    constant: value => value !== '0',
    frequency: {
      validation: value => parseInt(value, 10) > 1,
      calc: true,
    },
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>(['duration', 'cycle', 'constant'])
  valuePropsMap.set('frequency', t('global.times'))

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['type'])

  const extraValueList: { text: string; value: string }[] = []
  if (props['extra_value'] && props['extra_text']) {
    const originalValues = props['extra_value'].split(/\s*,,\s*/)
    const helper = computedBranchHelper(branchItem, originalValues)
    const values = originalValues.map(item => {
      let res = computeBranchValue(item, helper)
      if (isNumberString(res)) {
        res = numberStringToPercentage(res)
      }
      return res
    })
    const texts = props['extra_text'].split(/\s*,\s*/)
    extraValueList.push(...values.map((value, idx) => ({
      text: texts[idx] || '@',
      value,
    })))
  }

  const pureDatas = ['name']

  const displayData = handleDisplayData(branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })

  displayData.setCustomData('extraValueList', extraValueList)

  return displayData
}
