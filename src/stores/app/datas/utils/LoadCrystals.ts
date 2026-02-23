import { toInt } from '@/shared/utils/number'

import ItemsSystem from '@/lib/Items'
import { BagCrystal, type BagItemObtain } from '@/lib/Items/BagItem'

import type { CsvData } from './DownloadDatas'
import { getCsvDataRowGetterHelper, parseStatValueData } from './utils'

export function LoadCrystals(root: ItemsSystem, csvData: CsvData) {
  const { createRowGetter } = getCsvDataRowGetterHelper({
    'name': 0,
    'id': 1,
    'attr/category': 1,
    'attr/name': 2,
    'attr/value1': 3,
    'attr/value2': 4,
  })

  const TYPE_CHECKING_ID = '0'
  const BOSS_TYPE_CHECKING_ID = '1'

  let currentCrystal: BagCrystal
  let currentObtain: BagItemObtain
  let currentCategory: string
  let currentType: number
  let currentBossType: number
  csvData.forEach((rowData, index) => {
    if (index === 0) {
      return
    }

    const { row } = createRowGetter(rowData)

    if (!row('name') && !row('attr/category') && !row('attr/name')) {
      return
    }

    try {
      if (row('name') === TYPE_CHECKING_ID) {
        currentType = toInt(row('id')) ?? -1
        return
      }

      if (row('name') === BOSS_TYPE_CHECKING_ID) {
        currentBossType = toInt(row('id')) ?? -1
        return
      }

      if (row('name') !== '' && row('attr/category') !== '') {
        currentCrystal = root.appendCrystal(row('name'), currentType, currentBossType)
      }
      if (row('attr/category') !== '') {
        currentCategory = row('attr/category')
        if (currentCategory === 'obtain') {
          currentObtain = currentCrystal.appendObtain()
        }
      }
      const propName = row('attr/name')
      const propValue = row('attr/value1')
      if (currentCategory === 'stats') {
        const { type, value } = parseStatValueData(propValue)
        currentCrystal.appendStat(propName, value, type, row('attr/value2'))
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
