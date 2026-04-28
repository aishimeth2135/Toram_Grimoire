export interface EnchantConditional {
  condition: string
  potential: [number, number]
}

export interface EnchantItem {
  statId: string
  potential: [number, number]
  limit: [[number | null, number | null], [number | null, number | null]]
  extraLimit: [[string | null, string | null], [string | null, string | null]]
  unitValue: [[number, number], [number, number]]
  materialPointType: number
  materialPointValue: [number | null, number | null]
  potentialConvertThreshold: [number | null, number | null]
  conditionals: EnchantConditional[]
}

export interface EnchantCategory {
  title: string
  weaponOnly: boolean
  items: EnchantItem[]
}

export type EnchantData = EnchantCategory[]

/** keyed by zh-TW title */
export interface EnchantLocale {
  [title: string]: {
    title?: string
  }
}
