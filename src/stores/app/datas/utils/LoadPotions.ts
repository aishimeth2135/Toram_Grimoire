import {
  type BagItemObtain,
  BagPotion,
  type BagPotionsCategory,
  type BagPotionsObtainCategory,
  BagPotionsRoot,
} from '@/lib/Items/BagItem'

import type { CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper, parseStatValueData } from './utils'

export function LoadPotions(root: BagPotionsRoot, csvData: CsvData) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'name': 0,
    'attr/category': 1,
    'attr/name': 2,
    'attr/value1': 3,
    'attr/value2': 4,
    'category/id': 1,
    'category/name': 2,
  })

  let currentObtain: BagItemObtain
  let currentCategory: BagPotionsCategory
  let currentObtainCategory: BagPotionsObtainCategory
  let currentPotion: BagPotion
  let currentAttrCategory: string
  csvData.forEach((dataRow, rowIndex) => {
    if (rowIndex === 0) {
      return
    }
    const { row } = createRowGetter(dataRow)

    if (!row('name') && !row('attr/category') && !row('attr/name')) {
      return
    }
    try {
      const name = row('name')
      if (name === '0') {
        currentCategory = root.appendCategory(row('category/id'), row('category/name'))
        return
      }
      if (name === '1') {
        currentObtainCategory = currentCategory.appendObtainCategory(
          row('category/id'),
          row('category/name')
        )
        return
      }

      if (name !== '' && row('attr/category') !== '') {
        currentPotion = currentObtainCategory.appendPotion(name)
      }
      if (row('attr/category') !== '') {
        currentAttrCategory = row('attr/category')
        if (currentAttrCategory === 'obtain') {
          currentObtain = currentPotion.appendObtain()
        }
      }
      const propName = row('attr/name')
      const propValue = row('attr/value1')
      if (currentAttrCategory === 'stats') {
        const { type, value } = parseStatValueData(propValue)
        currentPotion.appendStat(propName, value, type, row('attr/value2'))
      } else if (currentAttrCategory === 'obtain') {
        if (['name', 'map', 'dye', 'type', 'npc'].includes(propName)) {
          currentObtain[propName as keyof BagItemObtain] = propValue
        }
      }
    } catch (error) {
      console.warn('[LoadPotion] unknown error')
      console.log(row, rowIndex)
      console.log(error)
    }
  })
}
