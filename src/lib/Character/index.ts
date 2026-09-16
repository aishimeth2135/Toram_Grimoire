import { markRaw } from 'vue'

import { CharacterStatCategory } from './Character'
import { StatBase } from './Stat'

export default class CharacterSystem {
  readonly statList: StatBase[]
  readonly characterStatCategoryList: CharacterStatCategory[]

  private constructor() {
    this.statList = []
    this.characterStatCategoryList = []
  }

  static create(): CharacterSystem {
    return markRaw(new CharacterSystem())
  }

  appendStatBase(...args: Parameters<typeof StatBase.create>): StatBase {
    const statBase = StatBase.create(...args)
    this.statList.push(statBase)
    return statBase
  }

  appendCharacterStatCategory(name: string): CharacterStatCategory {
    const category = CharacterStatCategory.create(this, name)
    this.characterStatCategoryList.push(category)
    return category
  }

  findStatBase(baseId: string): StatBase | null {
    return this.statList.find(stat => stat.baseId === baseId) || null
  }

  findStatBaseFromText(text: string): StatBase | undefined {
    return this.statList.find(stat => stat.text === text)
  }
}
