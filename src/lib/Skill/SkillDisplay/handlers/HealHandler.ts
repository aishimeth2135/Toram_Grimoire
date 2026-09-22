import Grimoire from '@/shared/Grimoire'
import { CommonLogger } from '@/shared/services/Logger'
import { toInt } from '@/shared/utils/number'
import { isNumberString } from '@/shared/utils/string'

import { parseListProperty } from '@/lib/Skill/Properties'
import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import { type HandleBranchValuePropsMap } from '../compute'
import {
  type HandleBranchLangPropsMap,
  type HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import type { HealExtraItem } from './handle/DisplayDataContainer'
import MapContainer from './handle/MapContainer'

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
      source: 'computed',
    },
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>([
    'duration',
    'cycle',
    'constant',
  ])
  valuePropsMap.set('frequency', t('global.times'))

  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>(['type'])

  const extraItems: HealExtraItem[] = []
  if (props.has('extra_value') && props.has('extra_text')) {
    const values = props.get('extra_value')!.split(/\s*,,\s*/)
    const texts = parseListProperty(props.get('extra_text')!)
    if (values.length !== texts.length) {
      CommonLogger.warn(
        'HealHandler',
        'Mismatched extra values and labels',
        branchItem.defaultBranchId
      )
    }
    Array.from({ length: Math.max(values.length, texts.length) }, (_value, idx) => {
      const key = `@extra_value[${idx}]`
      const value = values[idx] ?? '0'
      props.set(key, value)
      const keepFormat = isNumberString(value) && parseFloat(value) >= 10
      valuePropsMap.set(key, { toPersentage: !keepFormat })
      extraItems.push({ key, text: texts[idx] ?? '' })
    })
  }

  const pureDatas = ['name', 'target']

  const displayData = handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
    sources: Object.fromEntries(
      extraItems.map((item, index) => [
        item.key,
        [{ branch: branchItem, key: 'extra_value', index }],
      ])
    ),
  })

  displayData.setCustomData('healExtraItems', extraItems)

  return displayData
}
