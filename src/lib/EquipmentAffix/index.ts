import { markRaw } from 'vue'

import { EquipmentAffixItem } from './EquipmentAffix/EquipmentAffixItem'
import type { EquipmentAffixCategory } from './EquipmentAffix/enums'

export default class EquipmentAffixSystem {
  equipmentAffixItems: EquipmentAffixItem[]

  constructor() {
    this.equipmentAffixItems = markRaw([])
  }

  appendEquipmentAffixItem(id: string, category: EquipmentAffixCategory, name: string) {
    const newItem = markRaw(new EquipmentAffixItem(id, category, name))
    this.equipmentAffixItems.push(newItem)
    return newItem
  }
}

export type { EquipmentAffixItem }
