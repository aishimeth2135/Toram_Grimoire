import Grimoire from '@/shared/Grimoire'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

import { CharacterBuildBindOnCharacter } from '../Character'

interface RegistletBuildSaveData {
  name: string
  items: RegistletItemSaveData[]
}

interface RegistletItemSaveData {
  id: string
  level: number
  enabled: boolean
}

class RegistletBuild implements CharacterBuildBindOnCharacter {
  private static _autoIncrement: number = 0

  instanceId: number
  name: string
  items: RegistletItem[]
  loadedId: string | null

  constructor(name: string = '') {
    this.instanceId = RegistletBuild._autoIncrement
    RegistletBuild._autoIncrement += 1

    this.loadedId = null
    this.name = name
    this.items = []
  }

  appendItem(base: RegistletItemBase) {
    this.items.push(new RegistletItem(base))
  }

  save(): RegistletBuildSaveData {
    return {
      name: this.name,
      items: this.items.map(item => item.save()),
    }
  }

  clone(): RegistletBuild {
    const newBuild = new RegistletBuild(this.name + ' *')
    newBuild.items = this.items.map(item => item.clone())
    return newBuild
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return (
      this.loadedId !== null &&
      id !== null &&
      `${loadCategory}-${id}` === this.loadedId
    )
  }

  static load(data: RegistletBuildSaveData) {
    const newBuild = new RegistletBuild(data.name)
    newBuild.items = data.items
      .map(item => RegistletItem.load(item))
      .filter(item => item) as RegistletItem[]
    return newBuild
  }
}

class RegistletItem {
  base: RegistletItemBase
  level: number
  enabled: boolean

  constructor(base: RegistletItemBase) {
    this.base = base
    this.level = base.maxLevel
    this.enabled = true
  }

  save(): RegistletItemSaveData {
    return {
      id: this.base.id,
      level: this.level,
      enabled: this.enabled,
    }
  }

  clone(): RegistletItem {
    const newItem = new RegistletItem(this.base)
    newItem.level = this.level
    newItem.enabled = this.enabled
    return newItem
  }

  static load(data: RegistletItemSaveData) {
    const base = Grimoire.Registlet.getRegistletItemById(data.id)
    if (base) {
      const newItem = new RegistletItem(base)
      newItem.level = data.level
      newItem.enabled = data.enabled
      return newItem
    }
    return null
  }
}

export { RegistletBuild }
export type { RegistletItem, RegistletBuildSaveData }
