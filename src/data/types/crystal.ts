export interface ItemObtain {
  name?: string
  map?: string
  dye?: string
  type?: string
  npc?: string
}

export interface ItemStat {
  name: string
  value1: string
  value2: string
}

export interface CrystalEntry {
  name: string
  type: number
  bossType: number
  stats: ItemStat[]
  obtains: ItemObtain[]
  enhancer?: string
}

export type CrystalData = CrystalEntry[]

/** keyed by crystal name in zh-TW */
export interface CrystalLocale {
  [crystalName: string]: {
    name?: string
  }
}
