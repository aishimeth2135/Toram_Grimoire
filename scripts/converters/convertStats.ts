import type { CsvData } from '../utils'
import type { StatData, StatLocale } from '../../src/data/types/stats'

export function convertStats(csv: CsvData): StatData {
  const result: StatData = []

  csv.forEach((row, index) => {
    if (index === 0 || row[0] === '') return

    const hidden = row[5] === '1' ? true : row[5] === 'dev' ? ('dev' as const) : false

    result.push({
      baseName: row[0],
      caption: row[1],
      hasMultiplier: row[3] !== '無',
      order: parseInt(row[4]) || 999,
      hidden,
      constantFormula: row[2] ?? '',
    })
  })

  return result
}

export function convertStatsLocale(baseCsv: CsvData, langCsv: CsvData): StatLocale {
  const locale: StatLocale = {}

  baseCsv.forEach((baseRow, index) => {
    if (index === 0 || baseRow[0] === '') return

    const langRow = langCsv[index]
    if (!langRow) return

    const caption = langRow[0]?.trim()
    const constantFormula = langRow[1]?.trim()
    if (caption || constantFormula) {
      locale[baseRow[0]] = {}
      if (caption) locale[baseRow[0]].caption = caption
      if (constantFormula) locale[baseRow[0]].constantFormula = constantFormula
    }
  })

  return locale
}
