export interface GlossaryRow {
  name: string
  values: string[]
}

export interface GlossaryTag {
  name: string
  rows: GlossaryRow[]
}

export type GlossaryData = GlossaryTag[]

/** keyed by tagName → frameName → translated value(s) */
export interface GlossaryLocale {
  [tagName: string]: {
    tagName?: string
    frames?: {
      [frameName: string]: string[]
    }
  }
}
