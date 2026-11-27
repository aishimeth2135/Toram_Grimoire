import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data/parseFormula'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

export interface CharacterEquipmentTraitSaveData {
  id: string
  uid?: string
  level: number
  stack: number
}

class CharacterEquipmentTrait {
  readonly base: EquipmentTraitItem
  level: number
  currentStack: number
  private pendingStackLimit = false

  private constructor(base: EquipmentTraitItem, level = 1) {
    this.base = base
    this.level = level
    this.currentStack = 1
  }

  static create(base: EquipmentTraitItem, level = 1): CharacterEquipmentTrait {
    return new CharacterEquipmentTrait(base, level)
  }

  getMaxStack(vars: Record<string, number> = {}): number | null {
    const formula = this.base.getStackInfo('max')
    if (formula === '') {
      return 1
    }
    const max = computeFormula(formula, { ...vars, Lv: this.level }, NaN)
    return typeof max === 'number' && Number.isFinite(max) && max >= 1 ? max : null
  }

  resolvePendingStackLimit(vars: () => Record<string, number>) {
    if (this.pendingStackLimit) {
      this.applyStackLimit(vars())
    }
  }

  private applyStackLimit(vars?: Record<string, number>) {
    const max = this.getMaxStack(vars)
    this.pendingStackLimit = max === null
    if (max !== null && this.currentStack > max) {
      this.currentStack = max
    }
  }

  save(): CharacterEquipmentTraitSaveData {
    return {
      id: this.base.id,
      uid: this.base.uid,
      level: this.level,
      stack: this.currentStack,
    }
  }

  static fromLoad(data: CharacterEquipmentTraitSaveData): CharacterEquipmentTrait | null {
    const base = Grimoire.EquipmentTrait.findEquipmentTraitItemById(data.id, data.uid)
    if (!base) {
      return null
    }
    const trait = CharacterEquipmentTrait.create(base, Math.min(data.level, base.maxLevel))
    trait.currentStack = data.stack
    trait.applyStackLimit()
    return trait
  }
}

export { CharacterEquipmentTrait }
