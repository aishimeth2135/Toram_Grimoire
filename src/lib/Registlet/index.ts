import { markRaw } from 'vue'

import { RegistletCategory, RegistletItemBaseSkill, RegistletItemBaseStat } from './Registlet'
import { RegistletCategoryIds } from './Registlet/enums'

export default class RegistletSystem {
  skillCategory: RegistletCategory<RegistletItemBaseSkill>
  statCategory: RegistletCategory<RegistletItemBaseStat>

  constructor() {
    this.skillCategory = markRaw(new RegistletCategory<RegistletItemBaseSkill>(RegistletCategoryIds.skill))
    this.statCategory = markRaw(new RegistletCategory<RegistletItemBaseStat>(RegistletCategoryIds.skill))
  }
}
