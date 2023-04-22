import { markRaw } from 'vue'

import { BagItem } from './BagItem'

class BagPotionsRoot {
  readonly categorys: BagPotionsCategory[]
  readonly allPotions: BagPotion[]

  constructor() {
    this.categorys = markRaw([])
    this.allPotions = markRaw([])
  }

  appendCategory(id: string, name: string): BagPotionsCategory {
    const category = markRaw(new BagPotionsCategory(this, id, name))
    this.categorys.push(category)
    return category
  }

  findPotionById(id: string) {
    return this.allPotions.find(potion => potion.id === id) ?? null
  }
}

class BagPotionsCategory {
  readonly root: BagPotionsRoot
  readonly id: string
  readonly name: string

  readonly obtainCategorys: BagPotionsObtainCategory[]

  constructor(parent: BagPotionsRoot, id: string, name: string) {
    this.root = parent
    this.id = id
    this.name = name
    this.obtainCategorys = markRaw([])
  }

  appendObtainCategory(id: string, name: string): BagPotionsObtainCategory {
    const obtainCategory = markRaw(
      new BagPotionsObtainCategory(this, `${this.id}-${id}`, name)
    )
    this.obtainCategorys.push(obtainCategory)
    return obtainCategory
  }
}

class BagPotionsObtainCategory {
  private readonly _parent: BagPotionsCategory
  readonly id: string
  readonly name: string
  readonly potions: BagPotion[]

  constructor(parent: BagPotionsCategory, id: string, name: string) {
    this._parent = parent
    this.id = id
    this.name = name
    this.potions = markRaw([])
  }

  appendPotion(name: string): BagPotion {
    const potion = markRaw(
      new BagPotion(this, `${this.id}-${this.potions.length}`, name)
    )
    this._parent.root.allPotions.push(potion)
    this.potions.push(potion)
    return potion
  }

  get belongCategory() {
    return this._parent
  }
}

class BagPotion extends BagItem {
  private readonly _parent: BagPotionsObtainCategory
  healType: 'hp' | 'mp' | null

  constructor(parent: BagPotionsObtainCategory, id: string, name: string) {
    super(id, name)
    this._parent = parent
    this.healType = null
  }

  get belongCategory() {
    return this._parent.belongCategory
  }
}

export { BagPotionsRoot, BagPotion }
export type { BagPotionsCategory, BagPotionsObtainCategory }
