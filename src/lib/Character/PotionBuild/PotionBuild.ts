import Grimoire from '@/shared/Grimoire'

import { BagPotion, BagPotionsCategory } from '@/lib/Items/BagItem'

import { CharacterBuildBindOnCharacter } from '../Character'

interface PotionBuildSaveData {
  id: number
  name: string
  potions: PotionItemSaveData[]
}
interface PotionItemSaveData {
  id: string
  enabled?: boolean
}

class PotionBuild implements CharacterBuildBindOnCharacter {
  private static _autoIncrement = 0

  readonly instanceId: number
  loadedId: string | null
  name: string

  private readonly _categorysMap: Map<BagPotionsCategory, PotionItemsCategory>
  private readonly _itemsMap: Map<BagPotion, PotionItem>
  readonly items: PotionItem[]
  readonly categorys: PotionItemsCategory[]

  constructor(name: string) {
    this.instanceId = PotionBuild._autoIncrement
    PotionBuild._autoIncrement += 1
    this.loadedId = null

    this.name = name
    this._categorysMap = new Map()
    this._itemsMap = new Map()
    this.items = []
    this.categorys = []
  }

  private _getCategory(base: BagPotion): PotionItemsCategory {
    const category = base.belongCategory
    if (!this._categorysMap.has(category)) {
      const itemsCategory = new PotionItemsCategory(this, category)
      this._categorysMap.set(category, itemsCategory)
      this.categorys.push(itemsCategory)
    }
    return this._categorysMap.get(category)!
  }

  removeCategory(base: BagPotionsCategory): void {
    this._categorysMap.delete(base)
    const idx = this.categorys.findIndex(item => item.base === base)
    this.categorys.splice(idx, 1)
  }

  itemSelected(base: BagPotion): boolean {
    return this._itemsMap.has(base)
  }

  toggleItem(base: BagPotion): void {
    const idx = this.items.findIndex(item => item.base === base)
    if (idx > -1) {
      const category = this.items[idx].belongCategory
      this.items.splice(idx, 1)
      this._itemsMap.delete(base)
      category.removeItem(base)
    } else {
      this._appendItem(base)
    }
  }

  private _appendItem(base: BagPotion): PotionItem {
    const category = this._getCategory(base)
    const newItem = new PotionItem(this, category, base)
    this._itemsMap.set(newItem.base, newItem)
    this.items.push(newItem)
    category.items.push(newItem)
    return newItem
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
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
        const newItem = newBuild._appendItem(potion)
        if (potionData.enabled) {
          newItem.belongCategory.toggleItem(newItem.base)
        }
      }
    })
    return newBuild
  }
}

class PotionItemsCategory {
  private readonly _build: PotionBuild
  readonly base: BagPotionsCategory
  readonly items: PotionItem[]
  private _selectedPotionBase: BagPotion | null

  constructor(build: PotionBuild, base: BagPotionsCategory) {
    this._build = build
    this.base = base
    this.items = []
    this._selectedPotionBase = null
  }

  itemSelected(base: BagPotion) {
    return this._selectedPotionBase === base
  }

  toggleItem(base: BagPotion, force?: boolean) {
    if (base === this._selectedPotionBase && force !== true) {
      this._selectedPotionBase = null
    } else if (force !== false) {
      this._selectedPotionBase = base
    }
  }

  removeItem(itemBase: BagPotion) {
    const idx = this.items.findIndex(item => item.base === itemBase)
    if (idx > -1) {
      this.items.splice(idx, 1)
      if (this.items.length === 0) {
        this._build.removeCategory(this.base)
      }
    }
  }
}

class PotionItem {
  private readonly _build: PotionBuild
  private readonly _category: PotionItemsCategory
  base: BagPotion

  constructor(
    build: PotionBuild,
    category: PotionItemsCategory,
    base: BagPotion
  ) {
    this._build = build
    this._category = category
    this.base = base
  }

  get enabled(): boolean {
    return this._category.itemSelected(this.base)
  }

  set enabled(value: boolean) {
    this._category.toggleItem(this.base, value)
  }

  get belongCategory() {
    return this._category
  }

  remove() {
    this._build.toggleItem(this.base)
  }

  save(): PotionItemSaveData {
    const data: PotionItemSaveData = {
      id: this.base.id,
    }
    if (this.enabled) {
      data.enabled = true
    }
    return data
  }
}

export type { PotionBuildSaveData, PotionItemsCategory, PotionItem }
export { PotionBuild }
