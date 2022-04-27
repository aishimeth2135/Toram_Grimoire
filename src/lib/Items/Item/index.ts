
import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'
import { Images } from '@/shared/services/Images'

import { StatTypes } from '@/lib/Character/Stat/enums'
import { Stat } from '@/lib/Character/Stat'

interface ItemObtain {
  name: string;
  map?: string;
  dye?: string;
  type?: string;
  npc?: string;
}

interface ItemRecipe {
  item_level?: number;
  item_difficulty?: number;
  materials?: ItemRecipeMaterialItem[];
  cost?: number;
  potential?: number;
}

interface ItemExtra {
  caption?: string;
}

class Item {
  id: number
  name: string
  stats: Stat[]
  statRestrictions: string[]
  obtains: ItemObtain[]
  recipe: null | ItemRecipe
  extra: null | ItemExtra

  constructor(id: number, name: string) {
    this.id = id
    this.name = name

    this.stats = []
    this.statRestrictions = []

    this.obtains = []

    this.recipe = null
    this.extra = null
  }
  appendObtain(): ItemObtain {
    const obtain = {
      name: '',
    }
    this.obtains.push(obtain)
    return obtain
  }
  appendStat(baseId: string, value: number | string, tail: string, restriction: string) {
    if (typeof value === 'string') {
      value = isNumberString(value) ? parseFloat(value) : 0
    }
    const type = (() => {
      if (tail === '%') {
        return StatTypes.Multiplier
      }
      if (tail === '~') {
        return StatTypes.Total
      }
      return StatTypes.Constant
    })()
    const statBase = Grimoire.Character.findStatBase(baseId)
    if (!statBase) {
      console.warn('[Character] Can\'t find stat-base with id: ' + baseId)
      return
    }
    const stat = statBase.createStat(type, value)
    this.stats.push(stat)
    this.statRestrictions.push(restriction)
  }
  setExtra(): ItemExtra {
    this.extra = {}
    return this.extra
  }
}

class Equipment extends Item {
  category: number
  baseValue: number
  baseStability: number
  caption: string
  unknowCategory: null | string

  constructor(id: number, name: string, category: number, baseValue: number, stability: number, caption: string) {
    super(id, name)

    this.category = category

    this.baseValue = baseValue
    this.baseStability = stability

    this.caption = caption

    this.unknowCategory = null
  }
  setRecipe(): ItemRecipe {
    this.recipe = {}
    return this.recipe
  }
}

class Crystal extends Item {
  category: number
  bossCategory: number
  enhancer: null | string

  constructor(id: number, name: string, category: number, bossCategory: number) {
    super(id, name)

    this.category = category
    this.bossCategory = bossCategory
    this.enhancer = null
  }
  setEnhancer(name: string) {
    this.enhancer = name
  }

  get crystalBaseIconPath() {
    const type = ['weapon', 'body', 'additional', 'special', 'normal'][this.category]
    return type ? Images.crystalIcons.get(type) : '#'
  }

  get crystalIconPath() {
    return this.enhancer ? Images.crystalIcons.get('enhance') : this.crystalBaseIconPath
  }
}

class ItemRecipeMaterialItem {
  name: string
  quantity: number

  constructor(name: string, quantity: number) {
    this.name = name
    this.quantity = quantity
  }
}

export { Equipment, Crystal, ItemRecipeMaterialItem }
export type { ItemObtain, ItemRecipe, ItemExtra }
