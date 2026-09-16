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
  readonly id: RegistletCategoryIds
  readonly items: ItemBase[]

  private constructor(id: RegistletCategoryIds) {
    this.id = id
    this.items = []
  }

  static create<ItemBase extends RegistletItemBase = RegistletItemBase>(
    id: RegistletCategoryIds
  ): RegistletCategory<ItemBase> {
    return new RegistletCategory<ItemBase>(id)
  }

  appendItem(item: ItemBase): void {
    this.items.push(item)
  }
}

abstract class RegistletItemBase {
  abstract link: any

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
}

class RegistletItemBaseSkill extends RegistletItemBase {
  override link: Skill[]
  declare category: RegistletCategory<RegistletItemBaseSkill>

  private constructor(
    category: RegistletCategory<RegistletItemBaseSkill>,
    infos: RegistletInfos,
    skills: Skill[]
  ) {
    super(category, infos)
    this.link = skills
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
  override link: StatBase
  declare category: RegistletCategory<RegistletItemBaseStat>

  private constructor(
    category: RegistletCategory<RegistletItemBaseStat>,
    infos: RegistletInfos,
    statBase: StatBase
  ) {
    super(category, infos)
    this.link = statBase
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
  override link: string
  declare category: RegistletCategory<RegistletItemBaseSpecial>

  private constructor(
    category: RegistletCategory<RegistletItemBaseSpecial>,
    infos: RegistletInfos
  ) {
    super(category, infos)
    this.link = ''
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
