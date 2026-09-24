import { markRaw } from 'vue'

import { BagCrystal, BagEquipment } from './BagItem'
import { BagPotionsRoot } from './BagItem'

export default class ItemsSystem {
  equipments: BagEquipment[]
  crystals: BagCrystal[]
  potionsRoot: BagPotionsRoot

  private constructor() {
    this.equipments = []
    this.crystals = []
    this.potionsRoot = BagPotionsRoot.create()
  }

  static create(): ItemsSystem {
    return markRaw(new ItemsSystem())
  }

  appendEquipment(
    name: string,
    category: number,
    baseValue: number,
    stability: number,
    caption: string
  ): BagEquipment {
    const item = BagEquipment.create(
      this.equipments.length.toString(),
      name,
      category,
      baseValue,
      stability,
      caption
    )
    this.equipments.push(item)
    return item
  }

  appendCrystal(name: string, category: number, bossCategory: number): BagCrystal {
    const item = BagCrystal.create(this.crystals.length.toString(), name, category, bossCategory)
    this.crystals.push(item)
    return item
  }
}
