import { StatBase } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import { RegistletCategoryIds } from './enums'

interface RegistletInfos {
  id: number;
  category: string;
  name: string;
  obtainLevels: number[];
  maxLevel: number;
  caption: string;
}

class RegistletCategory<ItemBase extends RegistletItemBase> {
  id: RegistletCategoryIds
  items: ItemBase[]

  constructor(id: RegistletCategoryIds) {
    this.id = id
    this.items = []
  }
}

abstract class RegistletItemBase {
  abstract link: any

  id: number
  category: string
  name: string
  obtainLevels: number[]
  maxLevel: number
  caption: string

  constructor(infos: RegistletInfos) {
    this.id = infos.id
    this.category = infos.category
    this.name = infos.name
    this.obtainLevels = infos.obtainLevels
    this.maxLevel = infos.maxLevel
    this.caption = infos.caption
  }
}

class RegistletItemBaseSkill extends RegistletItemBase {
  override link: Skill

  constructor(infos: RegistletInfos, skill: Skill) {
    super(infos)
    this.link = skill
  }
}

class RegistletItemBaseStat extends RegistletItemBase {
  override link: StatBase

  constructor(infos: RegistletInfos, statBase: StatBase) {
    super(infos)
    this.link = statBase
  }
}

export { RegistletCategory, RegistletItemBaseSkill, RegistletItemBaseStat }
