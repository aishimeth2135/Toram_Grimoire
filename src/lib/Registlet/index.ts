import { markRaw } from 'vue'

import { Skill } from '../Skill/Skill'
import {
  RegistletCategory,
  RegistletItemBaseSkill,
  RegistletItemBaseSpecial,
  RegistletItemBaseStat,
} from './Registlet'
import { RegistletCategoryIds } from './Registlet/enums'

export default class RegistletSystem {
  skillCategory: RegistletCategory<RegistletItemBaseSkill>
  statCategory: RegistletCategory<RegistletItemBaseStat>
  specialCategory: RegistletCategory<RegistletItemBaseSpecial>

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

  getRegistletItemsBySkill(skill: Skill): RegistletItemBaseSkill[] {
    if (!this._skillItemMap) {
      this._skillItemMap = new Map()
      this.skillCategory.items.forEach(item => {
        if (item.link) {
          if (!this._skillItemMap.has(item.link)) {
            this._skillItemMap.set(item.link, [])
          }
          this._skillItemMap.get(item.link)!.push(item)
        }
      })
    }
    return this._skillItemMap.get(skill) ?? []
  }
}
