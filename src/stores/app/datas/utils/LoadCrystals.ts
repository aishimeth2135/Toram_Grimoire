import { toInt } from '@/shared/utils/number'

import ItemsSystem from '@/lib/Items'
import { BagCrystal, type BagItemObtain } from '@/lib/Items/BagItem'

import type { CsvData } from './DownloadDatas'
import { parseItemStatData } from './utils'

export default function (root: ItemsSystem, csvData: CsvData) {
  const NAME = 0,
    ATTRIBUTE_CATEGORY = 1,
    ATTRIBUTE_NAME = 2,
    ATTRIBUTE_VALUES = [3, 4],
    TYPE_ID = 1,
    BOSS_TYPE_ID = 1

  let currentCrystal: BagCrystal
  let currentObtain: BagItemObtain
  let currentCategory: string
  let currentType: number
  let currentBossType: number
  csvData.forEach((row, index) => {
    if (index === 0) {
      return
    }
    if (!row[NAME] && !row[ATTRIBUTE_CATEGORY] && !row[ATTRIBUTE_NAME]) {
      return
    }
    try {
      if (row[NAME] === '0') {
        currentType = toInt(row[TYPE_ID]) ?? -1
        return
      }
      if (row[NAME] === '1') {
        currentBossType = toInt(row[BOSS_TYPE_ID]) ?? -1
        return
      }

      if (row[NAME] !== '' && row[ATTRIBUTE_CATEGORY] !== '') {
        currentCrystal = root.appendCrystal(row[NAME], currentType, currentBossType)
      }
      if (row[ATTRIBUTE_CATEGORY] !== '') {
        currentCategory = row[ATTRIBUTE_CATEGORY]
        if (currentCategory === 'obtain') {
          currentObtain = currentCrystal.appendObtain()
        }
      }
      const propName = row[ATTRIBUTE_NAME]
      const propValue = row[ATTRIBUTE_VALUES[0]]
      if (currentCategory === 'stats') {
        const { type, value } = parseItemStatData(propValue)
        currentCrystal.appendStat(propName, value, type, row[ATTRIBUTE_VALUES[1]])
      } else if (currentCategory === 'obtain') {
        if (['name', 'map', 'dye', 'type', 'npc'].includes(propName)) {
          currentObtain[propName as keyof BagItemObtain] = propValue
        }
      } else if (currentCategory === 'other') {
        if (propName === 'enhancer') {
          currentCrystal.setEnhancer(propValue)
        }
      }
    } catch (error) {
      console.warn('[LoadCrystal] unknown error')
      console.log(row, index)
      console.log(error)
    }
  })
}
