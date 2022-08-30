import { BookPageSectionTypes } from './enums'

class BookPage {
  private _sections: BookPageSection[]
  title: string

  constructor(title: string) {
    this._sections = []
    this.title = title
  }

  get sections() {
    return this._sections
  }

  appendSection(section: BookPageSection) {
    this._sections.push(section)
  }
}

class BookPageSection {
  type: BookPageSectionTypes
  cells: string[][]
  props: Map<string, string>

  constructor(type: BookPageSectionTypes) {
    this.type = type
    this.cells = []
    this.props = new Map()
  }
}

export { BookPage, BookPageSection }
