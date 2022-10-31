import { isNumberString, splitComma } from '@/shared/utils/string'

import ItemsSystem from '@/lib/Items'
import { Equipment, ItemRecipeMaterialItem } from '@/lib/Items/Item'
import type { ItemExtra, ItemObtain, ItemRecipe } from '@/lib/Items/Item'

import type { CsvData } from './DownloadDatas'

export default function (root: ItemsSystem, csvData: CsvData): void {
  const NAME = 0,
    CATEGORY = 1,
    BASE_VALUE = 2,
    BASE_STABILITY = 3,
    ATTRIBUTE_CATEGORY = 4,
    ATTRIBUTE_NAME = 5,
    ATTRIBUTE_VALUES = [6, 7],
    CAPTION = 8,
    CATEGORY_LIST = {
      單手劍: 0,
      雙手劍: 1,
      弓: 2,
      弩: 3,
      法杖: 4,

      魔導具: 5,
      拳套: 6,
      旋風槍: 7,
      拔刀劍: 8,

      箭矢: 100,
      小刀: 101,
      忍術卷軸: 102,
      盾牌: 200,
      身體裝備: 300,
      追加裝備: 400,
      特殊裝備: 500,
    } as Record<string, number>

  const processMaterails = (str: string) => {
    const materials: ItemRecipeMaterialItem[] = []
    const list = splitComma(str)
    list.forEach(item => {
      const parts = item.split('#')
      const name = parts[0],
        value = parts[1]
      if (name && value) {
        materials.push(new ItemRecipeMaterialItem(name, parseInt(value, 10)))
      }
    })
    return materials
  }

  let currentEquipment: Equipment
  let currentObtain: ItemObtain
  let currentRecipe: ItemRecipe
  let currentExtra: ItemExtra
  let currentCategory: string = ''
  csvData.forEach((row, index) => {
    if (!row || index === 0 || row.every(col => col === '')) {
      return
    }
    try {
      if (row[NAME] !== '' && row[CATEGORY] !== '') {
        const category = row[CATEGORY]
        const type = CATEGORY_LIST[category] ?? -1
        currentEquipment = root.appendEquipment(
          row[NAME],
          type === undefined ? -1 : type,
          isNumberString(row[BASE_VALUE]) ? parseInt(row[BASE_VALUE], 10) : 0,
          isNumberString(row[BASE_STABILITY])
            ? parseInt(row[BASE_STABILITY], 10)
            : 0,
          row[CAPTION]
        )
        if (type === undefined) {
          currentEquipment.unknowCategory = row[CATEGORY]
        }
      }
      if (row[ATTRIBUTE_CATEGORY] !== '') {
        currentCategory = row[ATTRIBUTE_CATEGORY]
        switch (currentCategory) {
          case 'obtain':
            currentObtain = currentEquipment.appendObtain()
            break
          case 'recipe':
            currentRecipe = currentEquipment.setRecipe()
            break
          case 'extra':
            currentExtra = currentEquipment.setExtra()
        }
      }
      const propName = row[ATTRIBUTE_NAME]
      const propValue = row[ATTRIBUTE_VALUES[0]]
      if (currentCategory === 'stats') {
        const valueStr = row[ATTRIBUTE_VALUES[0]]
        let tail = valueStr.slice(-1),
          value = valueStr
        if (tail !== '%' && tail !== '~') {
          tail = ''
        } else {
          value = valueStr.slice(0, -1)
        }
        currentEquipment.appendStat(
          propName,
          value,
          tail,
          row[ATTRIBUTE_VALUES[1]]
        )
      } else if (currentCategory === 'obtain') {
        if (['name', 'map', 'dye', 'type', 'npc'].includes(propName)) {
          currentObtain[propName as keyof ItemObtain] = propValue
        }
      } else if (currentCategory === 'extra') {
        if (propName === 'caption') {
          currentExtra[propName] = propValue
        }
      } else if (currentCategory === 'recipe') {
        const keys = [
          'item_level',
          'item_difficulty',
          'cost',
          'potential',
        ] as const
        if (keys.includes(propName as typeof keys[number])) {
          currentRecipe[propName as typeof keys[number]] = parseInt(
            propValue,
            10
          )
        } else if (propName === 'materials') {
          currentRecipe.materials = processMaterails(propValue)
        }
      }
    } catch (error) {
      console.warn('[LoadEquipment] unknow error')
      console.warn(row, index)
      console.warn(error)
    }
  })
}
