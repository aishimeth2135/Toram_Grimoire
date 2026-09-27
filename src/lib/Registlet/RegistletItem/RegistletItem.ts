import { markRaw } from 'vue'

import { StatBase, type StatComputed } from '@/lib/Character/Stat'
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

interface RegistletCategoryItemMap {
  [RegistletCategoryIds.Skill]: RegistletItemBaseSkill
  [RegistletCategoryIds.Stat]: RegistletItemBaseStat
  [RegistletCategoryIds.Special]: RegistletItemBaseSpecial
}

class RegistletCategory<ItemBase extends RegistletItemBase = RegistletItemBase> {
  readonly id: RegistletCategoryIds
  readonly items: ItemBase[]

  private constructor(id: RegistletCategoryIds) {
    this.id = id
    this.items = []
  }

  static create<Id extends RegistletCategoryIds>(
    id: Id
  ): RegistletCategory<RegistletCategoryItemMap[Id]> {
    return new RegistletCategory<RegistletCategoryItemMap[Id]>(id)
  }

  appendItem(item: ItemBase): void {
    this.items.push(item)
  }

  isSkill(): this is RegistletCategory<RegistletItemBaseSkill> {
    return this.id === RegistletCategoryIds.Skill
  }

  isStat(): this is RegistletCategory<RegistletItemBaseStat> {
    return this.id === RegistletCategoryIds.Stat
  }

  isSpecial(): this is RegistletCategory<RegistletItemBaseSpecial> {
    return this.id === RegistletCategoryIds.Special
  }
}

abstract class RegistletItemBase {
  readonly category: RegistletCategory
  readonly id: string
  readonly name: string
  readonly obtainLevels: number[]
  readonly maxLevel: number
  readonly powderCost: number
  readonly powderCostAdditional: number | null
  readonly rows: RegistletItemRow[]

  protected constructor(category: RegistletCategory, infos: RegistletInfos) {
    this.category = category
    this.id = `${category.id}-${infos.id}`
    this.name = infos.name
    this.obtainLevels = infos.obtainLevels
    this.maxLevel = infos.maxLevel
    this.powderCost = infos.powderCost
    this.powderCostAdditional = infos.powderCostAdditional
    this.rows = []
  }

  isSkill(): this is RegistletItemBaseSkill {
    return this.category.isSkill()
  }

  isStat(): this is RegistletItemBaseStat {
    return this.category.isStat()
  }

  isSpecial(): this is RegistletItemBaseSpecial {
    return this.category.isSpecial()
  }
}

class RegistletItemBaseSkill extends RegistletItemBase {
  skills: Skill[]
  declare category: RegistletCategory<RegistletItemBaseSkill>

  private constructor(
    category: RegistletCategory<RegistletItemBaseSkill>,
    infos: RegistletInfos,
    skills: Skill[]
  ) {
    super(category, infos)
    this.skills = skills
  }

  static create(
    category: RegistletCategory<RegistletItemBaseSkill>,
    infos: RegistletInfos,
    skills: Skill[]
  ): RegistletItemBaseSkill {
    return markRaw(new RegistletItemBaseSkill(category, infos, skills))
  }
}

class RegistletItemBaseStat extends RegistletItemBase {
  statBase: StatBase
  declare category: RegistletCategory<RegistletItemBaseStat>

  private constructor(
    category: RegistletCategory<RegistletItemBaseStat>,
    infos: RegistletInfos,
    statBase: StatBase
  ) {
    super(category, infos)
    this.statBase = statBase
  }

  static create(
    category: RegistletCategory<RegistletItemBaseStat>,
    infos: RegistletInfos,
    statBase: StatBase
  ): RegistletItemBaseStat {
    return markRaw(new RegistletItemBaseStat(category, infos, statBase))
  }
}

class RegistletItemBaseSpecial extends RegistletItemBase {
  declare category: RegistletCategory<RegistletItemBaseSpecial>
  buffStats: StatComputed[] | null

  private constructor(
    category: RegistletCategory<RegistletItemBaseSpecial>,
    infos: RegistletInfos
  ) {
    super(category, infos)
    this.buffStats = null
  }

  static create(
    category: RegistletCategory<RegistletItemBaseSpecial>,
    infos: RegistletInfos
  ): RegistletItemBaseSpecial {
    return markRaw(new RegistletItemBaseSpecial(category, infos))
  }
}

class RegistletItemRow {
  type: string
  value: string

  private constructor(type: string, value: string) {
    this.type = type
    this.value = value
  }

  static create(type: string, value: string): RegistletItemRow {
    return new RegistletItemRow(type, value)
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
