import { getLanguageDataResult } from '@/shared/services/Locale'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import ItemsSystem from '@/lib/Items'
import { BagEquipment, BagItemRecipeMaterial } from '@/lib/Items/BagItem'
import type { BagItemExtra, BagItemObtain, BagItemRecipe } from '@/lib/Items/BagItem'

import type { LocaleCsvDatas } from './DownloadDatas'
import { getCsvDataRowGetterHelper, parseStatValueData } from './utils'

export function LoadEquipments(root: ItemsSystem, datas: LocaleCsvDatas): void {
  const { createRowGetter, createLocaleMapping } = getCsvDataRowGetterHelper({
    'name': 0,
    'category': 1,
    'base-value': 2,
    'base-stability': 3,
    'attr/category': 4,
    'attr/name': 5,
    'attr/value1': 6,
    'attr/value2': 7,
    'caption': 8,
  })

  const CATEGORY_LIST = {
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

  const handleMaterials = (str: string) => {
    const materials: BagItemRecipeMaterial[] = []
    const list = splitComma(str)
    list.forEach(item => {
      const parts = item.split('#')
      const name = parts[0],
        value = parts[1]
      if (name && value) {
        materials.push(new BagItemRecipeMaterial(name, toInt(value) ?? 0))
      }
    })
    return materials
  }

  const csvData = getLanguageDataResult(
    datas,
    createLocaleMapping({
      name: 0,
    })
  )

  let currentEquipment: BagEquipment
  let currentObtain: BagItemObtain
  let currentRecipe: BagItemRecipe
  let currentExtra: BagItemExtra
  let currentCategory: string = ''
  csvData.forEach((rowData, index) => {
    if (index === 0 || rowData.every(col => col === '')) {
      return
    }

    const { row } = createRowGetter(rowData)

    try {
      if (row('name') !== '' && row('category') !== '') {
        const category = row('category')
        const type = CATEGORY_LIST[category] ?? -1
        currentEquipment = root.appendEquipment(
          row('name'),
          type,
          toInt(row('base-value')) ?? 0,
          toInt(row('base-stability')) ?? 0,
          row('caption')
        )
        if (type === -1) {
          currentEquipment.unknowCategory = row('category')
        }
      }
      if (row('attr/category') !== '') {
        currentCategory = row('attr/category')
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

      const propName = row('attr/name')
      const propValue = row('attr/value1')
      if (currentCategory === 'stats') {
        const { value, type } = parseStatValueData(row('attr/value1'))
        currentEquipment.appendStat(propName, value, type, row('attr/value2'))
      } else if (currentCategory === 'obtain') {
        if (['name', 'map', 'dye', 'type', 'npc'].includes(propName)) {
          currentObtain[propName as keyof BagItemObtain] = propValue
        }
      } else if (currentCategory === 'extra') {
        if (propName === 'caption') {
          currentExtra[propName] = propValue
        }
      } else if (currentCategory === 'recipe') {
        const keys = ['item_level', 'item_difficulty', 'cost', 'potential'] as const
        if (keys.includes(propName as (typeof keys)[number])) {
          currentRecipe[propName as (typeof keys)[number]] = toInt(propValue) ?? 0
        } else if (propName === 'materials') {
          currentRecipe.materials = handleMaterials(propValue)
        }
      }
    } catch (error) {
      console.warn('[LoadEquipment] unknown error')
      console.warn(row, index)
      console.warn(error)
    }
  })
}
