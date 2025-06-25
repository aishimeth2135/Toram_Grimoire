import { markRaw } from 'vue'

import { StatBase } from '@/lib/Character/Stat'
import { Skill } from '@/lib/Skill/Skill'

import { RegistletCategoryIds } from './enums'

interface RegistletInfos {
  id: string
  name: string
  obtainLevels: number[]
  maxLevel: number
  powderCost: number
  powderCostAdditional: number | null
}

class RegistletCategory<ItemBase extends RegistletItemBase = RegistletItemBase> {
  id: RegistletCategoryIds
  items: ItemBase[]

  constructor(id: RegistletCategoryIds) {
    this.id = id
    this.items = []
  }

  appendItem(item: ItemBase) {
    this.items.push(markRaw(item))
  }
}

abstract class RegistletItemBase {
  abstract link: any

  category: RegistletCategory
  id: string
  name: string
  obtainLevels: number[]
  maxLevel: number
  powderCost: number
  powderCostAdditional: number | null
  rows: RegistletItemRow[]

  constructor(category: RegistletCategory, infos: RegistletInfos) {
    this.category = category
    this.id = `${category.id}-${infos.id}`
    this.name = infos.name
    this.obtainLevels = infos.obtainLevels
    this.maxLevel = infos.maxLevel
    this.powderCost = infos.powderCost
    this.powderCostAdditional = infos.powderCostAdditional
    this.rows = []
  }
}

class RegistletItemBaseSkill extends RegistletItemBase {
  override link: Skill[]
  declare category: RegistletCategory<RegistletItemBaseSkill>

  constructor(
    category: RegistletCategory<RegistletItemBaseSkill>,
    infos: RegistletInfos,
    skills: Skill[]
  ) {
    super(category, infos)
    this.link = skills
  }
}

class RegistletItemBaseStat extends RegistletItemBase {
  override link: StatBase
  declare category: RegistletCategory<RegistletItemBaseStat>

  constructor(
    category: RegistletCategory<RegistletItemBaseStat>,
    infos: RegistletInfos,
    statBase: StatBase
  ) {
    super(category, infos)
    this.link = statBase
  }
}

class RegistletItemBaseSpecial extends RegistletItemBase {
  override link: string
  declare category: RegistletCategory<RegistletItemBaseSpecial>

  constructor(category: RegistletCategory<RegistletItemBaseSpecial>, infos: RegistletInfos) {
    super(category, infos)
    this.link = ''
  }
}

class RegistletItemRow {
  type: string
  value: string

  constructor(type: string, value: string) {
    this.type = type
    this.value = value
  }
}

export type { RegistletInfos }

export {
  RegistletCategory,
  RegistletItemBase,
  RegistletItemBaseSkill,
  RegistletItemBaseStat,
  RegistletItemBaseSpecial,
  RegistletItemRow,
}
