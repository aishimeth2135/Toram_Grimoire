import type { CsvData } from '../utils'
import type { CharacterStatData, CharacterStatCategory, CharacterStatEntry } from '../../src/data/types/character-stats'

const CATEGORY_CHECKING_ID = '0'

export function convertCharacterStats(csv: CsvData): CharacterStatData {
  const result: CharacterStatData = []
  let curCategory: CharacterStatCategory | null = null
  let curStat: CharacterStatEntry | null = null

  csv.forEach((row, index) => {
    if (index === 0 || row.every(col => col === '')) return

    const id = row[0]

    if (id === CATEGORY_CHECKING_ID) {
      curCategory = { name: row[1], stats: [] }
      result.push(curCategory)
      curStat = null
    } else if (id === '') {
      // conditional formula row
      if (curStat) {
        curStat.conditions.push({
          base: row[3],
          value: row[5],
          options: row[4],
        })
      }
    } else {
      if (!curCategory) return
      curStat = {
        id,
        name: row[1],
        displayFormula: row[2],
        link: row[3],
        limit: row[6],
        formula: row[5],
        hiddenOption: row[7],
        caption: row[8] ?? '',
        conditions: [],
      }
      curCategory.stats.push(curStat)
    }
  })

  return result
}
