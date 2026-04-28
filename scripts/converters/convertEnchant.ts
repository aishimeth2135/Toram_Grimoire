import type { CsvData } from '../utils'
import type { EnchantData, EnchantCategory, EnchantItem, EnchantConditional } from '../../src/data/types/enchant'

const CONDITION_LIST = ['主手武器', '身體裝備', '原有屬性']
const MATERIAL_POINT_TYPE_LIST = ['金屬', '獸品', '木材', '布料', '藥品', '魔素']

function parseItemValue(value: string): number | null {
  return value !== '' ? parseFloat(value) : null
}

function parseLimit(str: string): [number | null, number | null] {
  if (str === '') return [null, null]
  const parts = str.split('::')
  const l1 = parseItemValue(parts[0])
  const l2 = parts[1] === undefined ? (l1 !== null ? -l1 : null) : parseItemValue(parts[1])
  return [l1, l2]
}

function parseExtraLimit(str: string): [string | null, string | null] {
  if (str === '') return [null, null]
  const parts = str.split('::')
  return [parts[0] || null, parts[1] || null]
}

function parseUnitValue(str: string): [number, number] {
  const [s1, s2] = str.split('|')
  const v1 = parseInt(s1) || 1
  const v2 = s2 !== undefined ? parseInt(s2) || v1 : v1
  return [v1, v2]
}

export function convertEnchant(csv: CsvData): EnchantData {
  const result: EnchantData = []
  let currentCategory: EnchantCategory | null = null
  let currentItem: EnchantItem | null = null

  csv.forEach((row, index) => {
    if (index === 0) return

    const statId = row[0]
    const condition = row[1]

    if (statId === '') {
      const rowTypeCheck = condition
      if (rowTypeCheck === '') return

      if (rowTypeCheck === '0') {
        currentCategory = {
          title: row[2],
          weaponOnly: row[3] === 'weapon-only',
          items: [],
        }
        result.push(currentCategory)
        currentItem = null
        return
      }

      const conditionId = CONDITION_LIST.indexOf(condition)
      if (conditionId !== -1 && currentItem) {
        currentItem.conditionals.push({
          condition,
          potential: [
            parseItemValue(row[2]) as number,
            parseItemValue(row[5]) as number,
          ],
        })
      }
    } else {
      if (!currentCategory) return

      currentItem = {
        statId,
        potential: [parseItemValue(row[2]) as number, parseItemValue(row[5]) as number],
        limit: [parseLimit(row[3]), parseLimit(row[6])],
        extraLimit: [parseExtraLimit(row[4]), parseExtraLimit(row[7])],
        unitValue: [parseUnitValue(row[8]), parseUnitValue(row[9])],
        materialPointType: MATERIAL_POINT_TYPE_LIST.indexOf(row[10]),
        materialPointValue: [parseItemValue(row[11]), parseItemValue(row[12])],
        potentialConvertThreshold: [parseItemValue(row[13]), parseItemValue(row[14])],
        conditionals: [],
      }
      currentCategory.items.push(currentItem)
    }
  })

  return result
}
