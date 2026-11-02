import { CommonLogger } from '@/shared/services/Logger'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import {
  type BagItemObtain,
  type BagItemRecipe,
  BagItemRecipeMaterial,
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
  let currentRecipe: BagItemRecipe
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
        } else if (currentAttrCategory === 'recipe') {
          currentRecipe = currentPotion.setRecipe()
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
      } else if (currentAttrCategory === 'recipe') {
        const keys = ['item_level', 'item_difficulty', 'cost', 'potential'] as const
        if (keys.includes(propName as (typeof keys)[number])) {
          currentRecipe[propName as (typeof keys)[number]] = toInt(propValue) ?? 0
        } else if (propName === 'materials') {
          const materials: BagItemRecipeMaterial[] = []
          splitComma(propValue).forEach(item => {
            const [materialName, value] = item.split('#')
            if (materialName && value) {
              materials.push(BagItemRecipeMaterial.create(materialName, toInt(value) ?? 0))
            }
          })
          currentRecipe.materials = materials
        }
      } else if (currentAttrCategory === 'heal') {
        if (propName === 'hp' || propName === 'mp') {
          currentPotion.setHealInfo({
            type: propName,
            amount: propValue,
          })
        }
      }
    } catch (error) {
      CommonLogger.start('LoadPotions', 'unknown error').log(row, rowIndex).warn(error).end()
    }
  })
}
