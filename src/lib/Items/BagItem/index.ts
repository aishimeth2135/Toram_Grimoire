import Grimoire from '@/shared/Grimoire'
import { Images } from '@/shared/services/Images'
import { isNumberString } from '@/shared/utils/string'

import { StatRestriction } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat/enums'

interface BagItemObtain {
  name: string
  map?: string
  dye?: string
  type?: string
  npc?: string
}

interface BagItemRecipe {
  item_level?: number
  item_difficulty?: number
  materials?: BagItemRecipeMaterial[]
  cost?: number
  potential?: number
}

interface BagItemExtra {
  caption?: string
}

abstract class BagItem {
  id: string
  name: string
  stats: StatRestriction[]
  obtains: BagItemObtain[]
  recipe: BagItemRecipe | null
  extra: BagItemExtra | null

  constructor(id: string, name: string) {
    this.id = id
    this.name = name

    this.stats = []

    this.obtains = []

    this.recipe = null
    this.extra = null
  }

  appendObtain(): BagItemObtain {
    const obtain = {
      name: '',
    }
    this.obtains.push(obtain)
    return obtain
  }

  appendStat(
    baseId: string,
    value: number | string,
    tail: string,
    restriction: string
  ) {
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
      console.warn("[Character] Can't find stat-base with id: " + baseId)
      return
    }
    const stat = statBase.createStat(type, value)
    const statr = StatRestriction.fromOrigin(stat, restriction)
    this.stats.push(statr)
  }

  setExtra(): BagItemExtra {
    this.extra = {}
    return this.extra
  }
}

class BagEquipment extends BagItem {
  category: number
  baseValue: number
  baseStability: number
  caption: string
  unknowCategory: null | string

  constructor(
    id: string,
    name: string,
    category: number,
    baseValue: number,
    stability: number,
    caption: string
  ) {
    super(id, name)

    this.category = category

    this.baseValue = baseValue
    this.baseStability = stability

    this.caption = caption

    this.unknowCategory = null
  }
  setRecipe(): BagItemRecipe {
    this.recipe = {}
    return this.recipe
  }
}

class BagCrystal extends BagItem {
  category: number
  bossCategory: number
  enhancer: null | string

  constructor(
    id: string,
    name: string,
    category: number,
    bossCategory: number
  ) {
    super(id, name)

    this.category = category
    this.bossCategory = bossCategory
    this.enhancer = null
  }
  setEnhancer(name: string) {
    this.enhancer = name
  }

  get crystalBaseIconPath() {
    const type = ['weapon', 'body', 'additional', 'special', 'normal'][
      this.category
    ]
    return type ? Images.crystalIcons.get(type) : '#'
  }

  get crystalIconPath() {
    return this.enhancer
      ? Images.crystalIcons.get('enhance')
      : this.crystalBaseIconPath
  }

  getRelatedCrystals(crystals: BagCrystal[]) {
    const nameMap = new Map<string, BagCrystal>()
    const enhancerMap = new Map<string, BagCrystal>()
    crystals.forEach(crystal => {
      nameMap.set(crystal.name, crystal)
      if (crystal.enhancer) {
        enhancerMap.set(crystal.enhancer, crystal)
      }
    })
    const enhancers = (() => {
      const res: BagCrystal[] = []
      let cur: BagCrystal = this
      while (cur.enhancer) {
        const _cur = nameMap.get(cur.enhancer)
        if (!_cur) {
          break
        }
        res.push(_cur)
        cur = _cur
        if (cur.name === this.name) {
          break
        }
      }
      return res
    })()
    const prependeds = (() => {
      const res: BagCrystal[] = []
      let cur: BagCrystal = this
      do {
        const _cur = enhancerMap.get(cur.name)
        if (!_cur) {
          break
        }
        res.push(_cur)
        cur = _cur
      } while (cur.name !== this.name)
      return res
    })()

    return {
      enhancers,
      prependeds,
    }
  }
}

class BagItemRecipeMaterial {
  name: string
  quantity: number

  constructor(name: string, quantity: number) {
    this.name = name
    this.quantity = quantity
  }
}

export { BagEquipment, BagCrystal, BagItemRecipeMaterial, BagItem }
export type { BagItemObtain, BagItemRecipe, BagItemExtra }
