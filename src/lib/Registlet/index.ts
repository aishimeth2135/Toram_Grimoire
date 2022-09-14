import { markRaw } from 'vue'

import { RegistletItemBaseSkill, RegistletItemBaseStat } from './Registlet'

export class RegistletSystem {
  skillRegistletItems: RegistletItemBaseSkill[]
  statRegistletItems: RegistletItemBaseStat[]

  constructor() {
    this.skillRegistletItems = markRaw([])
    this.statRegistletItems = markRaw([])
  }
}
