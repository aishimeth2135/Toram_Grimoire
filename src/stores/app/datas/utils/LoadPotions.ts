import {
  type BagItemObtain,
  BagPotion,
  type BagPotionsCategory,
  type BagPotionsObtainCategory,
  BagPotionsRoot,
} from '@/lib/Items/BagItem'

import type { CsvData } from './DownloadDatas'
import { parseItemStatData } from './utils'

export default function (root: BagPotionsRoot, csvData: CsvData) {
  const NAME = 0,
    ATTRIBUTE_CATEGORY = 1,
    ATTRIBUTE_NAME = 2,
    ATTRIBUTE_VALUES = [3, 4],
    CATEGORY_ID = 1,
    CATEGIRY_NANE = 2

  let currentObtain: BagItemObtain
  let currentCategory: BagPotionsCategory
  let currentObtainCategory: BagPotionsObtainCategory
  let currentPotion: BagPotion
  let currentAttrCategory: string
  csvData.forEach((row, index) => {
    if (index === 0) {
      return
    }
    if (!row[NAME] && !row[ATTRIBUTE_CATEGORY] && !row[ATTRIBUTE_NAME]) {
      return
    }
    try {
      const name = row[NAME]
      if (name === '0') {
        currentCategory = root.appendCategory(row[CATEGORY_ID], row[CATEGIRY_NANE])
        return
      }
      if (name === '1') {
        currentObtainCategory = currentCategory.appendObtainCategory(
          row[CATEGORY_ID],
          row[CATEGIRY_NANE]
        )
        return
      }

      if (name !== '' && row[ATTRIBUTE_CATEGORY] !== '') {
        currentPotion = currentObtainCategory.appendPotion(name)
      }
      if (row[ATTRIBUTE_CATEGORY] !== '') {
        currentAttrCategory = row[ATTRIBUTE_CATEGORY]
        if (currentAttrCategory === 'obtain') {
          currentObtain = currentPotion.appendObtain()
        }
      }
      const propName = row[ATTRIBUTE_NAME]
      const propValue = row[ATTRIBUTE_VALUES[0]]
      if (currentAttrCategory === 'stats') {
        const { type, value } = parseItemStatData(propValue)
        currentPotion.appendStat(propName, value, type, row[ATTRIBUTE_VALUES[1]])
      } else if (currentAttrCategory === 'obtain') {
        if (['name', 'map', 'dye', 'type', 'npc'].includes(propName)) {
          currentObtain[propName as keyof BagItemObtain] = propValue
        }
      }
    } catch (error) {
      console.warn('[LoadPotion] unknown error')
      console.log(row, index)
      console.log(error)
    }
  })
}
