import Grimoire from '@/shared/Grimoire'

import { BagPotion } from '@/lib/Items/BagItem/BagPotion'

import { CharacterBuildBindOnCharacter } from '../Character'

interface PotionBuildSaveData {
  id: number
  name: string
  potions: PotionItemSaveData[]
}
interface PotionItemSaveData {
  id: string
  enabled: boolean
}

class PotionBuild implements CharacterBuildBindOnCharacter {
  private static _autoIncrement = 0

  readonly instanceId: number
  loadedId: string | null
  name: string

  readonly items: PotionItem[]
  private _itemsMap: Map<BagPotion, PotionItem>

  constructor(name: string) {
    this.instanceId = PotionBuild._autoIncrement
    PotionBuild._autoIncrement += 1
    this.name = name
    this.loadedId = null
    this.items = []
    this._itemsMap = new Map()
  }

  itemSelected(base: BagPotion): boolean {
    return this._itemsMap.has(base)
  }

  toggleItem(base: BagPotion) {
    const idx = this.items.findIndex(item => item.base === base)
    if (idx > -1) {
      this.items.splice(idx, 1)
      this._itemsMap.delete(base)
    } else {
      this._appendItem(new PotionItem(this, base))
    }
  }

  private _appendItem(newItem: PotionItem) {
    this._itemsMap.set(newItem.base, newItem)
    this.items.push(newItem)
  }

  matchLoadedId(loadCategory: string, id: number | null) {
    return this.loadedId !== null && `${loadCategory}-${id}` === this.loadedId
  }

  clone(): PotionBuild {
    const newBuild = new PotionBuild(this.name + ' *')
    this.items.forEach(potion => newBuild.items.push(potion))
    return newBuild
  }

  save(): PotionBuildSaveData {
    const potions = this.items.map(potion => potion.save())
    return {
      id: this.instanceId,
      name: this.name,
      potions,
    }
  }

  static load(loadedCategory: string, data: PotionBuildSaveData): PotionBuild {
    const newBuild = new PotionBuild(data.name)
    newBuild.loadedId = `${loadedCategory}-${data.id}`
    data.potions.forEach(potionData => {
      const potion = Grimoire.Items.potionsRoot.findPotionById(potionData.id)
      if (potion) {
        const newItem = new PotionItem(newBuild, potion)
        newItem.enabled = potionData.enabled
        newBuild._appendItem(newItem)
      }
    })
    return newBuild
  }
}

class PotionItem {
  private _parent: PotionBuild
  base: BagPotion
  enabled: boolean

  constructor(parent: PotionBuild, base: BagPotion) {
    this._parent = parent
    this.base = base
    this.enabled = true
  }

  remove() {
    this._parent.toggleItem(this.base)
  }

  save(): PotionItemSaveData {
    return {
      id: this.base.id,
      enabled: this.enabled,
    }
  }
}

export type { PotionBuildSaveData, PotionItem }
export { PotionBuild }
