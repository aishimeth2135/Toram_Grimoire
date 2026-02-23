import { toInt } from '@/shared/utils/number'

import EnchantSystem from '@/lib/Enchant'
import {
  EnchantCategory,
  EnchantItem,
  EnchantItemConditions,
  type MaterialPointTypeRange,
} from '@/lib/Enchant/Enchant'

import type { CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper } from './utils'

export function LoadEnchant(root: EnchantSystem, csvData: CsvData) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'stat-id': 0,
    'condition': 1,

    'potential/constant': 2,
    'limit/constant': 3,
    'extra-limit/constant': 4,
    'potential/multiplier': 5,
    'limit/multiplier': 6,
    'extra-limit/multiplier': 7,

    'unit-value/constant': 8,
    'unit-value/multiplier': 9,

    'material-point/type': 10,
    'material-point/value/constant': 11,
    'material-point/value/multiplier': 12,

    'potential-convert-threshold/constant': 13,
    'potential-convert-threshold/multiplier': 14,

    // For category rows
    'row-type-check': 1,
    'category/title': 2,
    'category/extra': 3,
  })

  const CONDITION_LIST = ['主手武器', '身體裝備', '原有屬性'],
    MATERIAL_POINT_TYPE_LIST = ['金屬', '獸品', '木材', '布料', '藥品', '魔素']

  const handleItemValue = (value: string) => (value !== '' ? parseFloat(value) : null)

  const handleLimit = (str: string): [number | null, number | null] => {
    if (str === '') {
      return [null, null]
    }
    const limitStrs = str.split('::')
    const l1 = handleItemValue(limitStrs[0])
    const l2 =
      limitStrs[1] === undefined ? (l1 !== null ? -1 * l1 : l1) : handleItemValue(limitStrs[1])
    return [l1, l2]
  }
  const handleExtraLimit = (str: string): [string | null, string | null] => {
    if (str === '') {
      return [null, null]
    }
    const limitStrs = str.split('::')
    const l1 = limitStrs[0] || null
    const l2 = limitStrs[1] || null
    return [l1, l2]
  }

  const handleUnitValue = (str: string): [number, number] => {
    const [str1, str2] = str.split('|')
    const v1 = toInt(str1) ?? 1
    const v2 = toInt(str2) ?? v1
    return [v1, v2]
  }

  const getPotentialParam = (
    rowGetter: ReturnType<typeof createRowGetter>['row']
  ): [number, number] => {
    return [
      handleItemValue(rowGetter('potential/constant')) as number,
      handleItemValue(rowGetter('potential/multiplier')) as number,
    ]
  }

  let currentCategory: EnchantCategory, currentItem: EnchantItem
  csvData.forEach((rowData, idx) => {
    if (idx === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    if (row('stat-id') === '') {
      const rowTypeCheck = row('row-type-check')
      if (rowTypeCheck === '') {
        return
      }
      if (rowTypeCheck === '0') {
        currentCategory = root.appendCategory(row('category/title'))
        if (row('category/extra') === 'weapon-only') {
          currentCategory.setWeaponOnly()
        }
        return
      }
      const conditionId = CONDITION_LIST.indexOf(row('condition'))
      if (conditionId !== -1) {
        const cond = [
          EnchantItemConditions.MainWeapon,
          EnchantItemConditions.BodyArmor,
          EnchantItemConditions.OriginalElement,
        ][conditionId]
        currentItem.appendConditionalProps(cond, {
          potential: getPotentialParam(row),
        })
      }
    } else {
      currentItem = currentCategory.appendItem({
        baseId: row('stat-id'),
        limit: [handleLimit(row('limit/constant')), handleLimit(row('limit/multiplier'))],
        extraLimit: [
          handleExtraLimit(row('extra-limit/constant')),
          handleExtraLimit(row('extra-limit/multiplier')),
        ],
        unitValue: [
          handleUnitValue(row('unit-value/constant')),
          handleUnitValue(row('unit-value/multiplier')),
        ],
        materialPointType: MATERIAL_POINT_TYPE_LIST.indexOf(
          row('material-point/type')
        ) as MaterialPointTypeRange,
        materialPointValue: [
          handleItemValue(row('material-point/value/constant')),
          handleItemValue(row('material-point/value/multiplier')),
        ],
        potentialConvertThreshold: [
          handleItemValue(row('potential-convert-threshold/constant')),
          handleItemValue(row('potential-convert-threshold/multiplier')),
        ],
        potential: getPotentialParam(row),
      })
    }
  })
}
