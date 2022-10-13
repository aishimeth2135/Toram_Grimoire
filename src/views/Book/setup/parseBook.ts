import { BookPage, BookPageSection } from './Book'
import { BookPageSectionTypes } from './Book/enums'

export function parseBook(rows: string[][]) {
  const SECTION_ID = 0
  const BOOK_TITLE = 1

  let curPage: BookPage
  let curSection: BookPageSection

  const pages: BookPage[] = []

  const appendPage = (title: string) => {
    const newPage = new BookPage(title)
    pages.push(newPage)
    curPage = newPage
  }

  const appendSection = (type: BookPageSectionTypes) => {
    if (!curPage) {
      appendPage('')
    }
    const newSection = new BookPageSection(type)
    curPage.appendSection(newSection)
    curSection = newSection
  }

  rows.forEach(row => {
    const sectionId = row[SECTION_ID]
    if (sectionId !== '') {
      if (sectionId === '---') {
        appendPage(row[BOOK_TITLE])
      } else if (sectionId.startsWith('@')) {
        appendSection(sectionId.slice(1) as BookPageSectionTypes)
      } else {
        const idx = row
          .slice()
          .reverse()
          .findIndex(value => value !== '')
        const cells = row.slice(0, row.length - idx)
        if (cells.length === 0) {
          return
        }
        if (!curSection) {
          appendSection(BookPageSectionTypes.Content)
        }
        curSection.cells.push(cells)
      }
    }
  })

  return pages
}
