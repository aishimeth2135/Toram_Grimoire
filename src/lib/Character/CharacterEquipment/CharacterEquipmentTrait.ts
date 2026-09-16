import Grimoire from '@/shared/Grimoire'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

export interface CharacterEquipmentTraitSaveData {
  id: string
  level: number
  stack: number
}

class CharacterEquipmentTrait {
  readonly base: EquipmentTraitItem
  level: number
  currentStack: number

  private constructor(base: EquipmentTraitItem, level = 1) {
    this.base = base
    this.level = level
    this.currentStack = 1
  }

  static create(base: EquipmentTraitItem, level = 1): CharacterEquipmentTrait {
    return new CharacterEquipmentTrait(base, level)
  }

  save(): CharacterEquipmentTraitSaveData {
    return {
      id: this.base.id,
      level: this.level,
      stack: this.currentStack,
    }
  }

  static fromLoad(data: CharacterEquipmentTraitSaveData): CharacterEquipmentTrait | null {
    const base = Grimoire.EquipmentTrait.findEquipmentTraitItemById(data.id)
    if (!base) {
      return null
    }
    const newTrait = CharacterEquipmentTrait.create(base, data.level)
    newTrait.currentStack = data.stack
    return newTrait
  }
}

export { CharacterEquipmentTrait }
