import Grimoire from '@/shared/Grimoire'

import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import { CharacterBindingBuild } from '../Character'
import { checkLoadedId, getLoadedId } from '../Character/CharacterBuild'

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

class RegistletBuild implements CharacterBindingBuild {
  private static _autoIncrement: number = 0

  private _itemsMap: Map<RegistletItemBase, RegistletItem>

  readonly id: number
  name: string
  loadedId: string | null
  items: RegistletItem[]

  constructor(name: string = '') {
    this.id = RegistletBuild._autoIncrement
    RegistletBuild._autoIncrement += 1

    this.loadedId = null
    this.name = name
    this._itemsMap = new Map()
    this.items = []
  }

  getItem(base: RegistletItemBase): RegistletItem | null {
    return this._itemsMap.get(base) ?? null
  }

  itemSelected(base: RegistletItemBase): boolean {
    return this._itemsMap.has(base)
  }

  toggleItem(base: RegistletItemBase): void {
    if (this._itemsMap.has(base)) {
      const idx = this.items.findIndex(item => item.base.id === base.id)
      this.items.splice(idx, 1)
      this._itemsMap.delete(base)
    } else {
      this._appendItem(new RegistletItem(this, base))
    }
  }

  private _appendItem(newItem: RegistletItem) {
    this._itemsMap.set(newItem.base, newItem)
    this.items.push(newItem)
  }

  save(): RegistletBuildSaveData {
    return {
      id: this.id,
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
    return checkLoadedId(this, loadCategory, id)
  }

  static load(loadedCategory: string, data: RegistletBuildSaveData) {
    const newBuild = new RegistletBuild(data.name)
    newBuild.loadedId = getLoadedId(loadedCategory, data.id)
    data.items.forEach(item => {
      const newItem = RegistletItem.load(newBuild, item)
      if (newItem) {
        newBuild._appendItem(newItem)
      }
    })
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
