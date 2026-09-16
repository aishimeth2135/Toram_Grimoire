import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { Images } from '@/shared/services/Images'
import { CommonLogger } from '@/shared/services/Logger'

import { StatRestriction } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

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

interface RelatedCrystalsResult {
  enhancers: BagCrystal[]
  prependeds: BagCrystal[]
}

abstract class BagItem {
  id: string
  name: string
  stats: StatRestriction[]
  obtains: BagItemObtain[]
  recipe: BagItemRecipe | null
  extra: BagItemExtra | null

  protected constructor(id: string, name: string) {
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

  appendStat(baseId: string, value: number, type: StatTypes, restriction: string): void {
    if (!baseId) {
      return
    }
    const statBase = Grimoire.Character.findStatBase(baseId)
    if (!statBase) {
      CommonLogger.warn('Character', "Can't find stat-base with id: " + baseId)
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

  private constructor(
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

  static create(
    id: string,
    name: string,
    category: number,
    baseValue: number,
    stability: number,
    caption: string
  ): BagEquipment {
    return markRaw(new BagEquipment(id, name, category, baseValue, stability, caption))
  }

  setRecipe(): BagItemRecipe {
    this.recipe = {}
    return this.recipe
  }

  isWeapon(): boolean {
    return this.category >= 0 && this.category < 200
  }
}

class BagCrystal extends BagItem {
  category: number
  bossCategory: number
  enhancer: null | string

  private constructor(id: string, name: string, category: number, bossCategory: number) {
    super(id, name)

    this.category = category
    this.bossCategory = bossCategory
    this.enhancer = null
  }

  static create(id: string, name: string, category: number, bossCategory: number): BagCrystal {
    return markRaw(new BagCrystal(id, name, category, bossCategory))
  }

  setEnhancer(name: string): void {
    this.enhancer = name
  }

  get crystalBaseIconPath(): string {
    const type = ['weapon', 'body', 'additional', 'special', 'normal'][this.category]
    return type ? Images.crystalIcons.get(type) : '#'
  }

  get crystalIconPath(): string {
    return this.enhancer ? Images.crystalIcons.get('enhance') : this.crystalBaseIconPath
  }

  getRelatedCrystals(crystals: BagCrystal[]): RelatedCrystalsResult {
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
      let cur: BagCrystal = this as BagCrystal
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
      let cur: BagCrystal = this as BagCrystal
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

  getRelatedCrystalsLists(crystals: BagCrystal[]): BagCrystal[] {
    const relatedCrystals = this.getRelatedCrystals(crystals)
    return [...relatedCrystals.enhancers, ...relatedCrystals.prependeds]
  }
}

class BagItemRecipeMaterial {
  name: string
  quantity: number

  private constructor(name: string, quantity: number) {
    this.name = name
    this.quantity = quantity
  }

  static create(name: string, quantity: number): BagItemRecipeMaterial {
    return new BagItemRecipeMaterial(name, quantity)
  }
}

export { BagEquipment, BagCrystal, BagItemRecipeMaterial, BagItem }
export type { BagItemObtain, BagItemRecipe, BagItemExtra }
