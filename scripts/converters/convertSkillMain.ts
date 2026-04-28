import type { CsvData } from '../utils'
import type { SkillMainData, SkillMainLocale } from '../../src/data/types/skill'

const CATEGORY_CHECK = '0'
const TREE_CHECK = '1'

export function convertSkillMain(csv: CsvData): SkillMainData {
  const result: SkillMainData = []

  csv.forEach((row, index) => {
    if (index === 0 || row[1] === '') return

    const type = row[0]
    const id = parseInt(row[1])
    if (isNaN(id)) return

    if (type === CATEGORY_CHECK) {
      result.push({ type, id, name: '' })
    } else if (type === TREE_CHECK) {
      result.push({ type, id, name: '', drawTreeCode: row[3] ?? '' })
    } else {
      // skill row
      const previousSkill = row[2] === '-' ? -1 : parseInt(row[2])
      const drawOrder = parseInt(row[3])
      result.push({
        type: '',
        id,
        name: '',
        previousSkill: isNaN(previousSkill) ? undefined : previousSkill,
        drawOrder: isNaN(drawOrder) ? undefined : drawOrder,
      })
    }
  })

  return result
}

export function convertSkillMainLocale(baseCsv: CsvData, langCsv: CsvData): SkillMainLocale {
  const locale: SkillMainLocale = {}

  baseCsv.forEach((baseRow, index) => {
    if (index === 0 || baseRow[1] === '') return

    const langRow = langCsv[index]
    const name = langRow?.[0]?.trim()
    if (!name) return

    const type = baseRow[0]
    const id = parseInt(baseRow[1])
    if (isNaN(id)) return

    const typeLabel = type === CATEGORY_CHECK ? 'category' : type === TREE_CHECK ? 'tree' : 'skill'
    locale[`${typeLabel}:${id}`] = { name }
  })

  return locale
}
