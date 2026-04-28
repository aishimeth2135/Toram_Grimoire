import { toInt } from '@/shared/utils/number'

import ItemsSystem from '@/lib/Items'
import { BagEquipment, BagItemRecipeMaterial } from '@/lib/Items/BagItem'

import type { EquipmentData, EquipmentLocale } from '@/data/types/equipment'
import { parseStatValueData } from './utils'

const CATEGORY_LIST: Record<string, number> = {
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
}

export function LoadEquipments(root: ItemsSystem, data: EquipmentData, locale?: EquipmentLocale) {
  data.forEach(entry => {
    try {
      const name = locale?.[entry.name]?.name ?? entry.name
      const type = CATEGORY_LIST[entry.category] ?? -1

      const equipment = root.appendEquipment(
        name,
        type,
        entry.baseValue,
        entry.stability,
        entry.caption
      )
      if (type === -1) {
        equipment.unknowCategory = entry.category
      }

      entry.stats.forEach(stat => {
        const { value, type: statType } = parseStatValueData(stat.value1)
        equipment.appendStat(stat.name, value, statType, stat.value2)
      })

      entry.obtains.forEach(obtainData => {
        const obtain = equipment.appendObtain()
        Object.assign(obtain, obtainData)
      })

      if (entry.recipe) {
        const recipe = equipment.setRecipe()
        recipe.item_level = entry.recipe.itemLevel
        recipe.item_difficulty = entry.recipe.itemDifficulty
        recipe.cost = entry.recipe.cost
        recipe.potential = entry.recipe.potential
        recipe.materials = entry.recipe.materials.map(
          m => new BagItemRecipeMaterial(m.name, m.quantity)
        )
      }

      if (entry.extra) {
        const extra = equipment.setExtra()
        if (entry.extra.caption) extra.caption = entry.extra.caption
      }
    } catch (error) {
      console.warn('[LoadEquipments] unknown error', entry.name, error)
    }
  })
}
