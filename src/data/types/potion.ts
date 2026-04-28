import type { ItemObtain, ItemStat } from './crystal'

export interface PotionEntry {
  name: string
  stats: ItemStat[]
  obtains: ItemObtain[]
}

export interface PotionObtainCategory {
  id: string
  name: string
  potions: PotionEntry[]
}

export interface PotionCategory {
  id: string
  name: string
  obtainCategories: PotionObtainCategory[]
}

export type PotionData = PotionCategory[]

/** keyed by "category:id", "obtainCategory:id", or "potion:name" */
export interface PotionLocale {
  [key: string]: {
    name?: string
  }
}
