import {
  type BagItemObtain,
  BagPotion,
  type BagPotionsRoot,
} from '@/lib/Items/BagItem'

import type { PotionData, PotionLocale } from '@/data/types/potion'
import { parseStatValueData } from './utils'

export function LoadPotions(root: BagPotionsRoot, data: PotionData, locale?: PotionLocale) {
  data.forEach(categoryEntry => {
    try {
      const categoryName = locale?.[`category:${categoryEntry.id}`]?.name ?? categoryEntry.name
      const category = root.appendCategory(categoryEntry.id, categoryName)

      categoryEntry.obtainCategories.forEach(obtainCatEntry => {
        const obtainCatName =
          locale?.[`obtainCategory:${obtainCatEntry.id}`]?.name ?? obtainCatEntry.name
        const obtainCategory = category.appendObtainCategory(obtainCatEntry.id, obtainCatName)

        obtainCatEntry.potions.forEach(potionEntry => {
          const potionName = locale?.[`potion:${potionEntry.name}`]?.name ?? potionEntry.name
          const potion = obtainCategory.appendPotion(potionName)

          potionEntry.stats.forEach(stat => {
            const { value, type } = parseStatValueData(stat.value1)
            potion.appendStat(stat.name, value, type, stat.value2)
          })

          potionEntry.obtains.forEach(obtainData => {
            const obtain = potion.appendObtain()
            Object.assign(obtain, obtainData)
          })
        })
      })
    } catch (error) {
      console.warn('[LoadPotions] unknown error', categoryEntry, error)
    }
  })
}
