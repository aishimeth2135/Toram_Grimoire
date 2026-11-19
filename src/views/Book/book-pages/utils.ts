import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { BookPageSection } from '../setup/Book'

export function getSectionContentMd(section: BookPageSection) {
  if (!DOMPurify.isSupported) {
    return ''
  }

  const html = marked.parse(section.cells[0]?.[0] ?? '', { async: false })
  return DOMPurify.sanitize(html)
}

export function getSectionCellMap(section: BookPageSection) {
  const map = new Map<string, string>()
  section.cells.forEach(row => {
    if (row[0] !== '') {
      map.set(row[0], row[1])
    }
  })
  return map
}
