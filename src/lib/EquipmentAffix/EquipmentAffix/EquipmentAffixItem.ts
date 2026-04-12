import type { StatComputed } from '@/lib/Character/Stat'

import type { EquipmentAffixCategory } from './enums'

class EquipmentAffixItem {
  id: string
  category: EquipmentAffixCategory
  name: string
  caption: {
    description: string
    tips: string[]
  }
  stats: StatComputed[]
  stackInfo: {
    max: string
  } | null

  constructor(id: string, category: EquipmentAffixCategory, name: string) {
    this.id = id
    this.category = category
    this.name = name
    this.caption = {
      description: '',
      tips: [],
    }
    this.stats = []
    this.stackInfo = null
  }

  appendStat(stat: StatComputed) {
    this.stats.push(stat)
  }
}

export { EquipmentAffixItem }
