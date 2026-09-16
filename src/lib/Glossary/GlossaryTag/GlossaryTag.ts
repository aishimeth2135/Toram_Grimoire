class GlossaryTag {
  name: string
  readonly rows: GlossaryTagRow[]

  private constructor(name: string) {
    this.name = name
    this.rows = []
  }

  static create(name: string): GlossaryTag {
    return new GlossaryTag(name)
  }

  appendRow(type: string, value: string): GlossaryTagRow {
    const frame = GlossaryTagRow.create(type, value)
    this.rows.push(frame)
    return frame
  }
}

class GlossaryTagRow {
  readonly type: string
  readonly value: string[]

  private constructor(type: string, value: string) {
    this.type = type
    this.value = [value]
  }

  static create(type: string, value: string): GlossaryTagRow {
    return new GlossaryTagRow(type, value)
  }

  appendValue(value: string): void {
    if (value) {
      this.value.push(value)
    }
  }
}

export { GlossaryTag, GlossaryTagRow }
