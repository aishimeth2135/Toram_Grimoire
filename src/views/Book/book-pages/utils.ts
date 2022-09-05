import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { BookPageSection } from '../setup/Book'

export function getSectionContentMd(section: BookPageSection) {
  return marked.parse(DOMPurify.sanitize(section.cells[0][0]))
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
