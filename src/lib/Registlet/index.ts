import { markRaw } from 'vue'

import { Skill } from '../Skill/Skill'
import {
  RegistletCategory,
  RegistletItemBase,
  RegistletItemBaseSkill,
  RegistletItemBaseSpecial,
  RegistletItemBaseStat,
} from './Registlet'
import { RegistletCategoryIds } from './Registlet/enums'

export default class RegistletSystem {
  skillCategory: RegistletCategory<RegistletItemBaseSkill>
  statCategory: RegistletCategory<RegistletItemBaseStat>
  specialCategory: RegistletCategory<RegistletItemBaseSpecial>

  private _idItemMap!: Map<string, RegistletItemBase>
  private _skillItemMap!: Map<Skill, RegistletItemBaseSkill[]>

  constructor() {
    this.skillCategory = markRaw(
      new RegistletCategory<RegistletItemBaseSkill>(RegistletCategoryIds.Skill)
    )
    this.statCategory = markRaw(
      new RegistletCategory<RegistletItemBaseStat>(RegistletCategoryIds.Stat)
    )
    this.specialCategory = markRaw(
      new RegistletCategory<RegistletItemBaseSpecial>(
        RegistletCategoryIds.Special
      )
    )
  }

  getRegistletItemById(id: string): RegistletItemBase | null {
    if (!this._idItemMap) {
      this._idItemMap = new Map()
      const handle = (items: RegistletItemBase[]) => {
        items.forEach(item => {
          this._idItemMap.set(item.id, item)
        })
      }
      handle(this.skillCategory.items)
      handle(this.statCategory.items)
      handle(this.specialCategory.items)
    }
    return this._idItemMap.get(id) ?? null
  }

  getRegistletItemsBySkill(skill: Skill): RegistletItemBaseSkill[] {
    if (!this._skillItemMap) {
      this._skillItemMap = new Map()
      this.skillCategory.items.forEach(item => {
        item.link.forEach(link => {
          if (!this._skillItemMap.has(link)) {
            this._skillItemMap.set(link, [])
          }
          this._skillItemMap.get(link)!.push(item)
        })
      })
    }
    return this._skillItemMap.get(skill) ?? []
  }
}
