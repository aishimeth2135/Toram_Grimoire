export interface StatData {
  baseName: string
  caption: string
  hasMultiplier: boolean
  order: number
  hidden: boolean | 'dev'
  constantFormula: string
}

/** keyed by baseName */
export interface StatLocale {
  [baseName: string]: {
    caption?: string
    constantFormula?: string
  }
}
