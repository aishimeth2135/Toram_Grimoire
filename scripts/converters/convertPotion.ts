import type { CsvData } from '../utils'
import type { PotionData, PotionCategory, PotionObtainCategory, PotionEntry, ItemObtain } from '../../src/data/types/potion'

export function convertPotion(csv: CsvData): PotionData {
  const result: PotionData = []
  let currentCategory: PotionCategory | null = null
  let currentObtainCategory: PotionObtainCategory | null = null
  let currentPotion: PotionEntry | null = null
  let currentObtain: ItemObtain | null = null
  let currentAttrCategory = ''

  csv.forEach((row, index) => {
    if (index === 0) return
    if (!row[0] && !row[1] && !row[2]) return

    const name = row[0]
    const col1 = row[1]
    const col2 = row[2]
    const attrName = row[2]
    const attrValue1 = row[3] ?? ''

    if (name === '0') {
      currentCategory = { id: col1, name: col2, obtainCategories: [] }
      result.push(currentCategory)
      return
    }
    if (name === '1') {
      if (!currentCategory) return
      currentObtainCategory = { id: col1, name: col2, potions: [] }
      currentCategory.obtainCategories.push(currentObtainCategory)
      return
    }

    if (name !== '' && col1 !== '') {
      if (!currentObtainCategory) return
      currentPotion = { name, stats: [], obtains: [] }
      currentObtainCategory.potions.push(currentPotion)
    }

    if (col1 !== '') {
      currentAttrCategory = col1
      if (currentAttrCategory === 'obtain' && currentPotion) {
        currentObtain = {}
        currentPotion.obtains.push(currentObtain)
      }
    }

    if (!currentPotion) return

    if (currentAttrCategory === 'stats' && attrName) {
      currentPotion.stats.push({ name: attrName, value1: attrValue1, value2: row[4] ?? '' })
    } else if (currentAttrCategory === 'obtain' && currentObtain && attrName) {
      if (['name', 'map', 'dye', 'type', 'npc'].includes(attrName)) {
        currentObtain[attrName as keyof ItemObtain] = attrValue1
      }
    }
  })

  return result
}
