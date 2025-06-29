import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'
import { isNumberString, splitComma } from '@/shared/utils/string'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import {
  type HandleBranchValuePropsMap,
  computeBranchValue,
  computedBranchHelper,
} from '@/lib/Skill/SkillComputing/compute'

import {
  type HandleBranchLangPropsMap,
  type HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'
import { numberStringToPercentage } from './handle/utils'

export default function HealHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.heal.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    constant: value => value !== '0',
    frequency: {
      validation: value => (toInt(value) ?? 0) > 1,
      calc: true,
    },
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>([
    'duration',
    'cycle',
    'constant',
  ])
  valuePropsMap.set('frequency', t('global.times'))

  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>(['type'])

  const extraValueList: { text: string; value: string }[] = []
  if (props.has('extra_value') && props.has('extra_text')) {
    const originalValues = props.get('extra_value')!.split(/\s*,,\s*/)
    const helper = computedBranchHelper(computing, branchItem, originalValues)
    const values = originalValues.map(item => {
      let res = computeBranchValue(item, helper)
      if (isNumberString(res)) {
        res = numberStringToPercentage(res)
      }
      return res
    })
    const texts = splitComma(props.get('extra_text')!)
    extraValueList.push(
      ...values.map((value, idx) => ({
        text: texts[idx] || '@',
        value,
      }))
    )
  }

  const pureDatas = ['name', 'target']

  const displayData = handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })

  displayData.setCustomData('extraValueList', extraValueList)

  return displayData
}
