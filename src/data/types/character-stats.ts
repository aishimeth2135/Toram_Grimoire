export interface CharacterStatCondition {
  base: string
  value: string
  options: string
}

export interface CharacterStatEntry {
  id: string
  name: string
  displayFormula: string
  link: string
  limit: string
  formula: string
  hiddenOption: string
  caption: string
  conditions: CharacterStatCondition[]
}

export interface CharacterStatCategory {
  name: string
  stats: CharacterStatEntry[]
}

export type CharacterStatData = CharacterStatCategory[]

/** keyed by "section:name" or "stat:id" */
export interface CharacterStatLocale {
  [key: string]: {
    name?: string
  }
}
