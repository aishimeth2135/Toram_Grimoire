import { markRaw } from 'vue'

import { CharacterStatCategory } from './Character'
import { StatBase } from './Stat'

export default class CharacterSystem {
  statList: StatBase[]
  characterStatCategoryList: CharacterStatCategory[]

  constructor() {
    this.statList = markRaw([])
    this.characterStatCategoryList = markRaw([])
  }

  appendStatBase(...args: ConstructorParameters<typeof StatBase>): StatBase {
    const statBase = markRaw(new StatBase(...args))
    this.statList.push(statBase)
    return statBase
  }

  appendCharacterStatCategory(name: string): CharacterStatCategory {
    const category = markRaw(new CharacterStatCategory(this, name))
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
