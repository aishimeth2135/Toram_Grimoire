import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { StatComputed } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'

import { appendIterablePropertyIndex } from '../Properties/Iterable'
import { SkillBranchNames, SkillTypes } from './enums'

abstract class SkillNode {
  abstract parent: SkillNode | null
}

abstract class SkillElement extends SkillNode {
  readonly id: number
  name: string
  abstract get index(): number

  protected constructor(id: number, name: string) {
    super()
    this.id = id
    this.name = name
  }
}

class SkillRoot extends SkillNode {
  readonly parent: null
  readonly skillTreeCategorys: SkillTreeCategory[]

  private constructor() {
    super()
    this.parent = null
    this.skillTreeCategorys = []
  }

  static create(): SkillRoot {
    return markRaw(new SkillRoot())
  }

  get index() {
    return -1
  }

  appendSkillTreeCategory(id: number, name: string) {
    const el = SkillTreeCategory.create(this, id, name)
    this.skillTreeCategorys.push(el)
    return el
  }

  findSkillById(skillId: string): Skill | null {
    let find: Skill | null = null
    this.skillTreeCategorys.some(stc => {
      return stc.skillTrees.some(st => {
        const skill = st.skills.find(sk => sk.skillId === skillId)
        if (skill) {
          find = skill
          return true
        }
        return false
      })
    })
    return find
  }

  findSkillByName(skillName: string): Skill | null {
    let find: Skill | null = null
    this.skillTreeCategorys.some(stc => {
      return stc.skillTrees.some(st => {
        const skill = st.skills.find(sk => sk.name === skillName)
        if (skill) {
          find = skill
          return true
        }
        return false
      })
    })
    return find
  }
}

class SkillTreeCategory extends SkillElement {
  readonly parent: SkillRoot
  readonly skillTrees: SkillTree[]

  private constructor(sr: SkillRoot, id: number, name: string, skillTrees: SkillTree[]) {
    super(id, name)
    this.parent = sr
    this.skillTrees = skillTrees
  }

  static create(sr: SkillRoot, id: number, name: string): SkillTreeCategory {
    return markRaw(new SkillTreeCategory(sr, id, name, markRaw([])))
  }

  get index() {
    return this.parent.skillTreeCategorys.indexOf(this)
  }

  appendSkillTree(id: number, name: string) {
    const el = SkillTree.create(this, id, name)
    this.skillTrees.push(el)
    return el
  }
}

class SkillTree extends SkillElement {
  readonly parent: SkillTreeCategory
  readonly skills: Skill[]
  readonly attrs: {
    simulatorFlag: boolean
  }
  drawTreeCode: string
  readonly skillTreeId: string

  private constructor(stc: SkillTreeCategory, id: number, name: string) {
    super(id, name)
    this.parent = stc
    this.skills = []

    this.drawTreeCode = ''

    this.attrs = {
      simulatorFlag: false,
    }

    this.skillTreeId = `${this.parent.id}-${this.id}`
  }

  static create(stc: SkillTreeCategory, id: number, name: string): SkillTree {
    return markRaw(new SkillTree(stc, id, name))
  }

  get index() {
    return this.parent.skillTrees.indexOf(this)
  }

  init(dtc: string) {
    this.drawTreeCode = dtc
  }

  appendSkill(id: number, name: string) {
    const el = Skill.create(this, id, name)
    this.skills.push(el)
    return el
  }
}

abstract class SkillBase extends SkillElement {
  readonly parent: SkillTree
  caption: string
  previous: number
  drawOrder: number

  protected constructor(st: SkillTree, id: number, name: string, caption: string = '') {
    super(id, name)
    this.parent = st
    this.caption = caption
    this.previous = -1
    this.drawOrder = id
  }

  init(pre: number, drawOrder: number) {
    this.previous = pre
    this.drawOrder = drawOrder
  }
}

class Skill extends SkillBase {
  effects: SkillEffect[]
  defaultEffect!: SkillEffect
  types: SkillTypes[]

  readonly skillId: string

  private constructor(st: SkillTree, id: number, name: string, caption: string = '') {
    super(st, id, name, caption)

    this.effects = []
    this.skillId = `${this.parent.parent.id}-${this.parent.id}-${this.id}`

    this.types = []
  }

  static create(st: SkillTree, id: number, name: string, caption: string = ''): Skill {
    return markRaw(new Skill(st, id, name, caption))
  }

  get index() {
    return this.parent.skills.indexOf(this)
  }

  initTypes() {
    if (this.effects.some(eft => eft.branches.some(bch => bch.name === SkillBranchNames.Passive))) {
      this.types.push(SkillTypes.Passive)
    } else {
      this.types.push(SkillTypes.Active)
    }
    if (this.effects.some(eft => eft.branches.some(bch => bch.name === SkillBranchNames.Damage))) {
      this.types.push(SkillTypes.Damage)
    }
  }

  appendSkillEffect(main: number, sub: number, body: number) {
    const el = SkillEffect.create(this, this.effects.length, main, sub, body)
    this.effects.push(el)
    return el
  }

  appendSkillEffectHistory(effectId: number, date: string): SkillEffectHistory | void {
    const effect = this.effects.find(eft => eft.effectId === effectId)
    if (!effect) {
      console.warn(
        `[SkillEffect.appendSkillEffectHistory] can not find target effect with id: ${effectId}.`,
        this.effects
      )
      return
    }
    return effect.appendHistory(date)
  }

  setDefaultEffect(sef: SkillEffect) {
    this.defaultEffect = sef
    return this
  }
}

abstract class SkillEffectBase extends SkillNode {
  parent: Skill
  branches: SkillBranch[]

  protected constructor(skill: Skill, branches: SkillBranch[] = []) {
    super()
    this.parent = skill
    this.branches = branches
  }

  private getNextBranchId(name: SkillBranchNames): SkillBranchId {
    return SkillBranch.generateBranchId(this.parent.skillId, name, this.branches.length)
  }

  appendSkillBranch(overrideId: number, name: SkillBranchNames) {
    const branchId = this.getNextBranchId(name)
    const el = SkillBranch.create(this, overrideId, branchId, name)
    this.branches.push(el)
    return el
  }

  appendSkillBranchFrom(branch: SkillBranch) {
    const branchId = this.getNextBranchId(branch.name)
    const el = branch.cloneWithMarkRaw(branchId)
    this.branches.push(el)
    return el
  }
}

interface SkillEffectBasicProps {
  mpCost: string | null
  range: string | null
  skillType: number | null
  inCombo: number | null
  actionTime: number | null
  castingTime: string | null
}
class SkillEffect extends SkillEffectBase {
  effectId: number
  basicProps: SkillEffectBasicProps
  historys: SkillEffectHistory[]

  mainWeapon: number
  subWeapon: number
  bodyArmor: number
  // 0: or, 1: and
  equipmentOperator: 0 | 1

  private constructor(skill: Skill, effectId: number, main: number, sub: number, body: number) {
    super(skill)
    this.effectId = effectId
    this.historys = []
    this.basicProps = {
      mpCost: '0',
      range: '0',
      skillType: 0,
      inCombo: 0,
      actionTime: 3,
      castingTime: '0',
    }

    this.mainWeapon = main
    this.subWeapon = sub
    this.bodyArmor = body
    this.equipmentOperator = 0
  }

  static create(
    skill: Skill,
    effectId: number,
    main: number,
    sub: number,
    body: number
  ): SkillEffect {
    return markRaw(new SkillEffect(skill, effectId, main, sub, body))
  }

  appendHistory(date: string): SkillEffectHistory {
    const history = SkillEffectHistory.create(this, date)
    this.historys.push(history)
    return history
  }
}

class SkillEffectHistory extends SkillEffectBase {
  readonly date: string
  readonly parentEffect: SkillEffect

  private constructor(skillEffect: SkillEffect, date: string, branches: SkillBranch[]) {
    super(skillEffect.parent, branches)
    this.date = date
    this.parentEffect = skillEffect
  }

  static create(skillEffect: SkillEffect, date: string): SkillEffectHistory {
    return new SkillEffectHistory(skillEffect, date, markRaw([]))
  }
}

// Only for constructor type check, `branchId` will be store as string
type SkillBranchId = `${string}-${SkillBranchNames}-${number}`

class SkillBranch extends SkillNode {
  static generateBranchId(skillId: string, name: SkillBranchNames, indexId: number): SkillBranchId {
    return `${skillId}-${name}-${indexId}`
  }

  readonly parent: SkillEffectBase

  // id of branch for override detecting. -1 means no define
  overrideId: number

  readonly branchId: string

  // type of branch
  name: SkillBranchNames

  readonly props: Map<string, string>
  readonly stats: StatComputed[]

  private constructor(
    sef: SkillEffectBase,
    overrideId: number,
    branchId: SkillBranchId,
    name: SkillBranchNames,
    props: Map<string, string> = new Map(),
    stats: StatComputed[] = []
  ) {
    super()
    this.parent = sef
    this.overrideId = overrideId
    this.branchId = branchId as string
    this.name = name
    this.props = props
    this.stats = stats
  }

  static create(
    sef: SkillEffectBase,
    overrideId: number,
    branchId: SkillBranchId,
    name: SkillBranchNames
  ): SkillBranch {
    return markRaw(new SkillBranch(sef, overrideId, branchId, name))
  }

  get isEmpty() {
    return this.props.size === 0 && this.stats.length === 0
  }

  // Get index ID from format in `generateBranchId`
  getIndexId(): string {
    return this.branchId.split('-').pop()!
  }

  hasId(): boolean {
    return this.overrideId !== -1
  }

  appendProp(name: string, value: string, valueSub?: string) {
    if (valueSub) {
      name = appendIterablePropertyIndex(name, valueSub)
    }
    this.props.set(name, value)
    return this
  }

  appendStat(baseId: string, value: string, tail: string): StatComputed | null {
    const type = (() => {
      if (tail === '%') {
        return StatTypes.Multiplier
      }
      if (tail === '~') {
        return StatTypes.Total
      }
      return StatTypes.Constant
    })()
    const statBase = Grimoire.Character.findStatBase(baseId)
    if (!statBase) {
      return null
    }
    const stat = statBase.createStatComputedWithMarkRaw(type, value)
    this.stats.push(stat)
    return stat
  }

  clone(branchId: SkillBranchId): SkillBranch {
    return SkillBranch.createFrom(this, branchId)
  }

  cloneWithMarkRaw(branchId: SkillBranchId): SkillBranch {
    return SkillBranch.createFromWithMarkRaw(this, branchId)
  }

  static createFrom(branch: SkillBranch, branchId: SkillBranchId): SkillBranch {
    return new SkillBranch(
      branch.parent,
      branch.overrideId,
      branchId,
      branch.name,
      new Map(branch.props),
      branch.stats.map(stat => stat.clone())
    )
  }

  static createFromWithMarkRaw(branch: SkillBranch, branchId: SkillBranchId): SkillBranch {
    return markRaw(SkillBranch.createFrom(branch, branchId))
  }
}

class LevelSkillTree {
  base: SkillTree
  levelSkills: LevelSkill[]

  private constructor(st: SkillTree) {
    this.base = st
    this.levelSkills = []
  }

  static create(st: SkillTree): LevelSkillTree {
    return new LevelSkillTree(st)
  }

  appendLevelSkill(skill: Skill) {
    const el = LevelSkill.create(this, skill)
    this.levelSkills.push(el)
    return el
  }

  skillPointCost() {
    return this.levelSkills.reduce((cur, skill) => cur + skill.level(), 0)
  }

  starGemSkillPoint() {
    return this.levelSkills.reduce(
      (cur, skill) => cur + Math.max(0, skill.starGemLevel() - skill.level()),
      0
    )
  }
}

class LevelSkill {
  parent: LevelSkillTree
  base: Skill

  private _level: number
  private _starGemLevel: number

  private constructor(st: LevelSkillTree, skill: Skill) {
    this.parent = st
    this.base = skill

    this._level = 0
    this._starGemLevel = 0
  }

  static create(st: LevelSkillTree, skill: Skill): LevelSkill {
    return new LevelSkill(st, skill)
  }
  level(value?: number) {
    if (typeof value === 'number') {
      value = Math.max(0, Math.min(10, value))
      this._level = value
    }
    return this._level
  }
  addLevel(value: number) {
    this.level(this._level + value)
    return this._level
  }

  updateTree(forward = false) {
    if (!forward) {
      let current: LevelSkill = this as LevelSkill
      while (current.base.previous !== -1) {
        const pre = current.parent.levelSkills.find(sk => sk.base.id === current.base.previous)
        if (!pre) {
          break
        }
        current = pre
        if (current.level() < 5) {
          current.level(5)
        }
      }
    } else if (forward && this.level() < 5) {
      const stk: LevelSkill[] = [this]
      while (stk.length !== 0) {
        const current = stk.pop() as LevelSkill
        this.parent.levelSkills.forEach(skill => {
          if (skill.base.previous === current.base.id) {
            stk.push(skill)
            if (skill.level() > 0) {
              skill.level(0)
            }
          }
        })
      }
    }
  }
  starGemLevel(value?: number) {
    if (typeof value === 'number') {
      value = Math.max(0, Math.min(10, value))
      this._starGemLevel = value
    }

    return this._starGemLevel
  }
  addStarGemLevel(value: number) {
    this.starGemLevel(this._starGemLevel + value)
    return this._starGemLevel
  }

  get id() {
    return this.base.id
  }
}

export {
  SkillElement,
  SkillRoot,
  SkillTreeCategory,
  SkillTree,
  Skill,
  SkillEffect,
  SkillBranch,
  LevelSkillTree,
  LevelSkill,
  SkillEffectHistory,
}
export type { SkillEffectBase, SkillEffectBasicProps }
