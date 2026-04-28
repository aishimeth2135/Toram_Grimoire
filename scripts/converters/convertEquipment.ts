import type { CsvData } from '../utils'
import type {
  EquipmentData,
  EquipmentEntry,
  EquipmentLocale,
  EquipmentRecipe,
  EquipmentRecipeMaterial,
  ItemObtain,
} from '../../src/data/types/equipment'

function parseMaterials(str: string): EquipmentRecipeMaterial[] {
  return str
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      const [name, qty] = item.split('#')
      return { name, quantity: parseInt(qty) || 0 }
    })
}

export function convertEquipment(csv: CsvData): EquipmentData {
  const result: EquipmentData = []
  let currentEquipment: EquipmentEntry | null = null
  let currentObtain: ItemObtain | null = null
  let currentRecipe: EquipmentRecipe | null = null
  let currentCategory = ''

  csv.forEach((row, index) => {
    if (index === 0 || row.every(col => col === '')) return

    const name = row[0]
    const category = row[1]
    const attrCategory = row[4]
    const attrName = row[5]
    const attrValue1 = row[6] ?? ''
    const attrValue2 = row[7] ?? ''

    if (name !== '' && category !== '') {
      currentEquipment = {
        name,
        category,
        baseValue: parseInt(row[2]) || 0,
        stability: parseInt(row[3]) || 0,
        caption: row[8] ?? '',
        stats: [],
        obtains: [],
      }
      result.push(currentEquipment)
      currentObtain = null
      currentRecipe = null
      currentCategory = ''
    }

    if (!currentEquipment) return

    if (attrCategory !== '') {
      currentCategory = attrCategory
      if (currentCategory === 'obtain') {
        currentObtain = {}
        currentEquipment.obtains.push(currentObtain)
      } else if (currentCategory === 'recipe') {
        currentRecipe = {
          itemLevel: 0,
          itemDifficulty: 0,
          cost: 0,
          potential: 0,
          materials: [],
        }
        currentEquipment.recipe = currentRecipe
      } else if (currentCategory === 'extra') {
        currentEquipment.extra = { caption: '' }
      }
    }

    if (!attrName) return

    if (currentCategory === 'stats') {
      currentEquipment.stats.push({ name: attrName, value1: attrValue1, value2: attrValue2 })
    } else if (currentCategory === 'obtain' && currentObtain) {
      if (['name', 'map', 'dye', 'type', 'npc'].includes(attrName)) {
        currentObtain[attrName as keyof ItemObtain] = attrValue1
      }
    } else if (currentCategory === 'recipe' && currentRecipe) {
      const intKeys = ['item_level', 'item_difficulty', 'cost', 'potential'] as const
      if (intKeys.includes(attrName as (typeof intKeys)[number])) {
        const key = attrName as (typeof intKeys)[number]
        const keyMap: Record<typeof key, keyof EquipmentRecipe> = {
          item_level: 'itemLevel',
          item_difficulty: 'itemDifficulty',
          cost: 'cost',
          potential: 'potential',
        }
        ;(currentRecipe[keyMap[key]] as number) = parseInt(attrValue1) || 0
      } else if (attrName === 'materials') {
        currentRecipe.materials = parseMaterials(attrValue1)
      }
    } else if (currentCategory === 'extra' && currentEquipment.extra) {
      if (attrName === 'caption') {
        currentEquipment.extra.caption = attrValue1
      }
    }
  })

  return result
}

export function convertEquipmentLocale(baseCsv: CsvData, langCsv: CsvData): EquipmentLocale {
  const locale: EquipmentLocale = {}

  baseCsv.forEach((baseRow, index) => {
    if (index === 0 || baseRow.every(col => col === '')) return
    if (!baseRow[0] || !baseRow[1]) return // only rows that define a new equipment

    const langRow = langCsv[index]
    const translatedName = langRow?.[0]?.trim()
    if (translatedName) {
      locale[baseRow[0]] = { name: translatedName }
    }
  })

  return locale
}
