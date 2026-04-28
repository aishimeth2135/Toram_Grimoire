import type { ItemObtain, ItemStat } from './crystal'

export interface EquipmentRecipeMaterial {
  name: string
  quantity: number
}

export interface EquipmentRecipe {
  itemLevel: number
  itemDifficulty: number
  cost: number
  potential: number
  materials: EquipmentRecipeMaterial[]
}

export interface EquipmentExtra {
  caption: string
}

export interface EquipmentEntry {
  name: string
  category: string
  baseValue: number
  stability: number
  caption: string
  stats: ItemStat[]
  obtains: ItemObtain[]
  recipe?: EquipmentRecipe
  extra?: EquipmentExtra
}

export type EquipmentData = EquipmentEntry[]

/** keyed by equipment name */
export interface EquipmentLocale {
  [name: string]: {
    name?: string
  }
}
