import { markRaw } from 'vue'

import { BagCrystal, BagEquipment } from './BagItem'
import { BagPotionsRoot } from './BagItem'

export default class ItemsSystem {
  equipments: BagEquipment[]
  crystals: BagCrystal[]
  potionsRoot: BagPotionsRoot

  constructor() {
    this.equipments = markRaw([])
    this.crystals = markRaw([])
    this.potionsRoot = markRaw(new BagPotionsRoot())
  }

  appendEquipment(
    name: string,
    category: number,
    baseValue: number,
    stability: number,
    caption: string
  ): BagEquipment {
    const item = markRaw(
      new BagEquipment(
        this.equipments.length.toString(),
        name,
        category,
        baseValue,
        stability,
        caption
      )
    )
    this.equipments.push(item)
    return item
  }

  appendCrystal(
    name: string,
    category: number,
    bossCategory: number
  ): BagCrystal {
    const item = markRaw(
      new BagCrystal(
        this.crystals.length.toString(),
        name,
        category,
        bossCategory
      )
    )
    this.crystals.push(item)
    return item
  }
}
