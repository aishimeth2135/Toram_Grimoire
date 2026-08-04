import { markRaw } from 'vue'

import { EquipmentTraitItem } from './EquipmentTrait/EquipmentTrait'
import type { EquipmentTraitCategory } from './EquipmentTrait/enums'

export default class EquipmentTraitSystem {
  equipmentTraitItems: EquipmentTraitItem[]

  constructor() {
    this.equipmentTraitItems = markRaw([])
  }

  appendEquipmentTraitItem(
    id: string,
    category: EquipmentTraitCategory,
    name: string
  ): EquipmentTraitItem {
    const newId = EquipmentTraitItem.generateId(id, category)
    const newItem = markRaw(new EquipmentTraitItem(newId, category, name))
    this.equipmentTraitItems.push(newItem)
    return newItem
  }

  findEquipmentTraitItemById(id: string): EquipmentTraitItem | null {
    return this.equipmentTraitItems.find(item => item.id === id) ?? null
  }
}

export type { EquipmentTraitItem }
