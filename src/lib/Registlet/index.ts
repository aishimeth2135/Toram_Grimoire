import { markRaw } from 'vue'

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
}
