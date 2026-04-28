import type { CsvData } from '../utils'
import type { GlossaryData, GlossaryLocale, GlossaryTag, GlossaryRow } from '../../src/data/types/glossary'

export function convertGlossary(csv: CsvData): GlossaryData {
  const result: GlossaryData = []
  let curTag: GlossaryTag | null = null
  let curRow: GlossaryRow | null = null

  csv.forEach((row, index) => {
    if (index === 0) return

    const tagName = row[0]
    const frameName = row[1]
    const frameValue = row[2] ?? ''

    if (tagName !== '') {
      curTag = { name: tagName, rows: [] }
      result.push(curTag)
      curRow = null
    }
    if (!curTag) return

    if (frameName !== '') {
      curRow = { name: frameName, values: [frameValue] }
      curTag.rows.push(curRow)
    } else if (curRow) {
      curRow.values.push(frameValue)
    }
  })

  return result
}

export function convertGlossaryLocale(baseCsv: CsvData, langCsv: CsvData): GlossaryLocale {
  const locale: GlossaryLocale = {}
  let curTagName = ''
  let curFrameName = ''

  baseCsv.forEach((baseRow, index) => {
    if (index === 0) return

    const langRow = langCsv[index]
    if (!langRow) return

    const tagName = baseRow[0]
    const frameName = baseRow[1]

    // langCsv col 0 = translated tagName, col 1 = translated frameValue
    const translatedTagName = langRow[0]?.trim()
    const translatedFrameValue = langRow[1]?.trim()

    if (tagName !== '') {
      curTagName = tagName
      curFrameName = ''
      if (translatedTagName) {
        if (!locale[curTagName]) locale[curTagName] = {}
        locale[curTagName].tagName = translatedTagName
      }
    }

    if (!curTagName) return

    if (frameName !== '') {
      curFrameName = frameName
    }

    if (curFrameName && translatedFrameValue) {
      if (!locale[curTagName]) locale[curTagName] = {}
      if (!locale[curTagName].frames) locale[curTagName].frames = {}
      const frames = locale[curTagName].frames!
      if (!frames[curFrameName]) {
        frames[curFrameName] = [translatedFrameValue]
      } else {
        frames[curFrameName].push(translatedFrameValue)
      }
    }
  })

  return locale
}
