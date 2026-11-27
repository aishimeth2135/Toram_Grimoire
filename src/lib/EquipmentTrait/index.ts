import { markRaw } from 'vue'

import { EquipmentTraitItem } from './EquipmentTrait/EquipmentTrait'
import type { EquipmentTraitCategory } from './EquipmentTrait/enums'

export default class EquipmentTraitSystem {
  equipmentTraitItems: EquipmentTraitItem[]

  private constructor() {
    this.equipmentTraitItems = []
  }

  static create(): EquipmentTraitSystem {
    return markRaw(new EquipmentTraitSystem())
  }

  appendEquipmentTraitItem(
    id: string,
    category: EquipmentTraitCategory,
    name: string,
    uid?: string
  ): EquipmentTraitItem {
    const newId = EquipmentTraitItem.generateId(id, category)
    const newItem = EquipmentTraitItem.create(newId, category, name, uid)
    this.equipmentTraitItems.push(newItem)
    return newItem
  }

  findEquipmentTraitItemById(id: string, uid?: string): EquipmentTraitItem | null {
    return (
      this.equipmentTraitItems.find(item =>
        uid === undefined ? item.id === id : item.uid === uid
      ) ?? null
    )
  }
}

export type { EquipmentTraitItem }
