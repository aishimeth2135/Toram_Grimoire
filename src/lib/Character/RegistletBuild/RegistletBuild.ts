import Grimoire from '@/shared/Grimoire'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

import { CharacterBuildBindOnCharacter } from '../Character'

interface RegistletBuildSaveData {
  id: number
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

  itemSelected(base: RegistletItemBase): boolean {
    return this.items.some(item => item.base.id === base.id)
  }

  toggleItem(base: RegistletItemBase): void {
    const idx = this.items.findIndex(item => item.base.id === base.id)
    if (idx > -1) {
      // eslint-disable-next-line vue/no-mutating-props
      this.items.splice(idx, 1)
    } else {
      this.items.push(new RegistletItem(this, base))
    }
  }

  save(): RegistletBuildSaveData {
    return {
      id: this.instanceId,
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

  static load(loadedCategory: string, data: RegistletBuildSaveData) {
    const newBuild = new RegistletBuild(data.name)
    newBuild.loadedId = `${loadedCategory}-${data.id}`
    newBuild.items = data.items
      .map(item => RegistletItem.load(newBuild, item))
      .filter(item => item) as RegistletItem[]
    return newBuild
  }
}

class RegistletItem {
  private build: RegistletBuild
  base: RegistletItemBase
  level: number
  enabled: boolean

  constructor(build: RegistletBuild, base: RegistletItemBase) {
    this.build = build
    this.base = base
    this.level = base.maxLevel
    this.enabled = true
  }

  remove() {
    this.build.toggleItem(this.base)
  }

  save(): RegistletItemSaveData {
    return {
      id: this.base.id,
      level: this.level,
      enabled: this.enabled,
    }
  }

  clone(): RegistletItem {
    const newItem = new RegistletItem(this.build, this.base)
    newItem.level = this.level
    newItem.enabled = this.enabled
    return newItem
  }

  static load(build: RegistletBuild, data: RegistletItemSaveData) {
    const base = Grimoire.Registlet.getRegistletItemById(data.id)
    if (base) {
      const newItem = new RegistletItem(build, base)
      newItem.level = data.level
      newItem.enabled = data.enabled
      return newItem
    }
    return null
  }
}

export { RegistletBuild }
export type { RegistletItem, RegistletBuildSaveData }
