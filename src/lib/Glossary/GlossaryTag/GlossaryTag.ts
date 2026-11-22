type GlossaryTagRowType = 'caption' | 'list'

class GlossaryTag {
  name: string
  categoryText: string
  readonly rows: GlossaryTagRow[]

  private constructor(name: string) {
    this.name = name
    this.categoryText = ''
    this.rows = []
  }

  static create(name: string): GlossaryTag {
    return new GlossaryTag(name)
  }

  appendRow(type: GlossaryTagRowType, value: string): GlossaryTagRow {
    const frame = GlossaryTagRow.create(type, value)
    this.rows.push(frame)
    return frame
  }
}

class GlossaryTagRow {
  readonly type: GlossaryTagRowType
  readonly value: string[]

  private constructor(type: GlossaryTagRowType, value: string) {
    this.type = type
    this.value = [value]
  }

  static create(type: GlossaryTagRowType, value: string): GlossaryTagRow {
    return new GlossaryTagRow(type, value)
  }

  appendValue(value: string): void {
    if (value) {
      this.value.push(value)
    }
  }
}

export { GlossaryTag, GlossaryTagRow }
