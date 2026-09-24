import { markRaw } from 'vue'

import { BagItem } from './BagItem'

class BagPotionsRoot {
  readonly categorys: BagPotionsCategory[]
  readonly allPotions: BagPotion[]

  private constructor(categorys: BagPotionsCategory[], allPotions: BagPotion[]) {
    this.categorys = categorys
    this.allPotions = allPotions
  }

  static create(): BagPotionsRoot {
    return markRaw(new BagPotionsRoot(markRaw([]), markRaw([])))
  }

  appendCategory(id: string, name: string): BagPotionsCategory {
    const category = BagPotionsCategory.create(this, id, name)
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

  private constructor(
    parent: BagPotionsRoot,
    id: string,
    name: string,
    obtainCategorys: BagPotionsObtainCategory[]
  ) {
    this.root = parent
    this.id = id
    this.name = name
    this.obtainCategorys = obtainCategorys
  }

  static create(parent: BagPotionsRoot, id: string, name: string): BagPotionsCategory {
    return markRaw(new BagPotionsCategory(parent, id, name, markRaw([])))
  }

  appendObtainCategory(id: string, name: string): BagPotionsObtainCategory {
    const obtainCategory = BagPotionsObtainCategory.create(this, `${this.id}-${id}`, name)
    this.obtainCategorys.push(obtainCategory)
    return obtainCategory
  }
}

class BagPotionsObtainCategory {
  private readonly _parent: BagPotionsCategory
  readonly id: string
  readonly name: string
  readonly potions: BagPotion[]

  private constructor(parent: BagPotionsCategory, id: string, name: string, potions: BagPotion[]) {
    this._parent = parent
    this.id = id
    this.name = name
    this.potions = potions
  }

  static create(parent: BagPotionsCategory, id: string, name: string): BagPotionsObtainCategory {
    return markRaw(new BagPotionsObtainCategory(parent, id, name, markRaw([])))
  }

  appendPotion(name: string): BagPotion {
    const potion = BagPotion.create(this, `${this.id}-${this.potions.length}`, name)
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

  private constructor(parent: BagPotionsObtainCategory, id: string, name: string) {
    super(id, name)
    this._parent = parent
    this.healType = null
  }

  static create(parent: BagPotionsObtainCategory, id: string, name: string): BagPotion {
    return markRaw(new BagPotion(parent, id, name))
  }

  get belongCategory() {
    return this._parent.belongCategory
  }
}

export { BagPotionsRoot, BagPotion }
export type { BagPotionsCategory, BagPotionsObtainCategory }
