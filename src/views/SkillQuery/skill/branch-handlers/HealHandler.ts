import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import { type HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputing/compute'

import {
  type HandleBranchLangPropsMap,
  type HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
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

  const extraTextList: string[] = []
  if (props.has('extra_value') && props.has('extra_text')) {
    props
      .get('extra_value')!
      .split(/\s*,,\s*/)
      .forEach((item, idx) => {
        const key = `@extra_value[${idx}]`
        props.set(key, item)
        valuePropsMap.set(key, { toPersentage: true })
      })
    const texts = splitComma(props.get('extra_text')!)
    extraTextList.push(...texts)
  }

  const pureDatas = ['name', 'target']

  const displayData = handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })

  displayData.setCustomData('extraTextList', extraTextList)

  return displayData
}
