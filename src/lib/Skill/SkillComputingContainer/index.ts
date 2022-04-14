import { markRaw, reactive } from 'vue'

import { HandleFormulaTexts, HandleFormulaVars } from '@/shared/utils/data'

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { StatComputed } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat/enums'

import { Skill, SkillBranch, SkillEffect, SkillEffectHistory } from '../Skill'
import {
  convertEffectEquipment,
  effectOverwrite,
  separateSuffixBranches,
  handleVirtualBranches,
  regressHistoryBranches,
  setBranchAttrsDefaultValue,
  initStackStates,
  effectAttrsToBranch,
  initHistoryNexts,
  initBranchesPostpone,
} from './utils'
import { SkillBranchNames } from '../Skill/enums'
import { FormulaDisplayModes } from './enums'

interface HandleFormulaExtends {
  vars: HandleFormulaVars;
  texts: HandleFormulaTexts;
}

class SkillComputingContainer {
  vars: {
    characterLevel: number;
    skillLevel: number;
  }

  varGetters: {
    characterLevel: (() => number) | null;
    skillLevel: ((skill: Skill) => number) | null;
  }

  handleFormulaExtends: HandleFormulaExtends

  handleFormulaDynamicExtends: (() => HandleFormulaExtends)[]

  config: {
    formulaDisplayMode: FormulaDisplayModes;
    getFormulaExtraValue: ((formula: string) => number | null) | null;
  }

  constructor() {
    this.vars = {
      characterLevel: 250,
      skillLevel: 10,
    }
    this.varGetters = {
      characterLevel: null,
      skillLevel: null,
    }
    this.handleFormulaExtends = markRaw({
      vars: {},
      texts: {},
    })
    this.handleFormulaDynamicExtends = []
    this.config = {
      formulaDisplayMode: FormulaDisplayModes.Normal,
      getFormulaExtraValue: null,
    }
  }

  createSkillItem(skill: Skill) {
    return new SkillItem(this, skill)
  }
}

class SkillItem {
  readonly parent: SkillComputingContainer
  readonly skill: Skill
  readonly effectItems: SkillEffectItem[]

  constructor(parent: SkillComputingContainer, skill: Skill) {
    this.parent = parent
    this.skill = skill

    const defaultSef = skill.defaultEffect
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef)
    this.effectItems = [
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ]
  }

  findEffectItem(equipment: EquipmentRestriction) {
    return this.effectItems.find(effectItem => effectItem.equipmentMatch(equipment)) ?? null
  }
}

interface EquipmentRestriction {
  main: EquipmentTypes | null;
  sub: EquipmentTypes | null;
  body: EquipmentTypes | null;
}

interface BranchGroupState {
  readonly size: number;
  readonly expandable: boolean;
  expanded: boolean;
  parentExpanded: boolean;
  isGroupEnd: boolean;
}

interface BranchStackState {
  readonly stackId: number;
  readonly branch: SkillBranchItem;
  value: number;
}

abstract class SkillEffectItemBase {
  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[]

  readonly parent: SkillItem
  readonly stackStates: BranchStackState[]

  constructor(parent: SkillItem) {
    this.parent = parent

    // user-set
    this.stackStates = reactive([])
  }
}

class SkillEffectItem extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItem>[]

  readonly equipments: EquipmentRestriction[]
  readonly historys: SkillEffectItemHistory[]

  constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    super(parent)

    this.branchItems = defaultSef.branches.map(bch => new SkillBranchItem(this, bch))
    if (!this.branchItems.some(branchItem => branchItem.name === SkillBranchNames.Basic)) {
      const basicBranch = effectAttrsToBranch(defaultSef)
      this.branchItems.unshift(new SkillBranchItem(this, basicBranch))
    }

    const current = from ? from : defaultSef
    const dualSwordRegress = defaultSef.parent.effects.every(eft => eft.mainWeapon !== 10)
    this.equipments = markRaw(convertEffectEquipment(
      current.mainWeapon,
      current.subWeapon,
      current.bodyArmor,
      current.equipmentOperator,
      dualSwordRegress,
    ))

    this.historys = current.historys.map(history => new SkillEffectItemHistory(parent, this, history))

    if (from) {
      effectOverwrite(this, from)
    }
    setBranchAttrsDefaultValue(this)

    regressHistoryBranches(this)

    separateSuffixBranches(this)
    handleVirtualBranches(this)
    initBranchesPostpone(this)

    this.historys.forEach(history => {
      separateSuffixBranches(history)
      handleVirtualBranches(history)
      initStackStates(history)
      initHistoryNexts(history)
    })

    initStackStates(this)
  }

  equipmentMatch(equipment: EquipmentRestriction): boolean {
    return this.equipments.some(effectEquipment => {
      if (effectEquipment.main === null && effectEquipment.sub === null && effectEquipment.body === null) {
        return true
      }
      return (['main', 'sub', 'body'] as const).every(key => {
        if (effectEquipment[key] === null) {
          return true
        }
        return effectEquipment[key] === equipment[key]
      })
    })
  }

  equipmentId() {
    const keys = ['main', 'sub', 'body'] as const
    return this.equipments.map(equip => keys.map(key => equip[key] || 'none').join('+')).join('/')
  }
}

class SkillEffectItemHistory extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItemHistory>[]

  readonly origin: SkillEffectHistory
  readonly parentEffect: SkillEffectItem
  readonly date: string
  readonly introductionBranches: SkillBranchItem[]
  readonly removedBranches: SkillBranchItem[]
  nextEffect!: SkillEffectItemBase

  // store the previous branch of every item in branchItems
  nexts: Map<SkillBranchItem, SkillBranchItem | null>

  constructor(parent: SkillItem, parentEffect: SkillEffectItem, historyEffect: SkillEffectHistory) {
    super(parent)
    this.branchItems = historyEffect.branches.map(bch => new SkillBranchItem(this, bch))

    this.origin = historyEffect
    this.parentEffect = parentEffect
    this.date = historyEffect.date
    this.nexts = new Map()
    this.introductionBranches = markRaw([])
    this.removedBranches = markRaw([])
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => {
      if (branchItem.id !== -1 && this.origin.branches.find(bch => bch.id === branchItem.id)) {
        return true
      }
      return branchItem.suffixBranches.some(suffix => suffix.id !== -1 && this.origin.branches.find(bch => suffix.id === bch.id))
    })
  }
}

type SkillBranchItemOverwriteRecord<T> = {
  overwrite: T[];
  append: T[];
  remove: T[];
}
type SkillBranchItemOverwriteRecords = {
  attrs: SkillBranchItemOverwriteRecord<string>;
  stats: SkillBranchItemOverwriteRecord<[string, StatTypes]>;
}
abstract class SkillBranchItemBase<Parent extends SkillEffectItemBase = SkillEffectItemBase> {
  private _attrs: Record<string, string>

  private _name: SkillBranchNames
  private _inherit: SkillBranchNames | null

  // -1 means undefined
  readonly id: number

  readonly parent: Parent
  readonly stats: StatComputed[]

  readonly isEmpty: boolean

  /** (character-simulator only)
   * If true, the computing of this branch must be postponed until after all character stat have been computed.
   */
  postpone: boolean

  /* default branch from default effect that has not been overwritten  */
  readonly default: SkillBranch

  /** Record of overwrite */
  readonly record: SkillBranchItemOverwriteRecords

  /**
   * Record of overwrite for next of SkillBranchEffectHistory.nexts
   * this property should reference to record of other branch
  */
  private _historyRecord: SkillBranchItemOverwriteRecords | null

  abstract clone(): SkillBranchItemBase

  /**
   * @param parent parent SkillEffectItem
   * @param branch branch from default effect of skill, branch should be overwrite later
   */
  constructor(parent: Parent, branch: SkillBranch | SkillBranchItemBase) {
    this.parent = parent
    this.id = branch.id

    this._name = branch.name
    this._inherit = null
    this.name = this._name // init _inherit

    this._attrs = markRaw(Object.assign({}, branch instanceof SkillBranch ? branch.branchAttributes : branch.allAttrs))
    this.stats = markRaw(branch.stats.map(stat => stat.clone()))

    this.isEmpty = branch.isEmpty

    this.postpone = this._attrs['postpone'] === '1'
    delete this._attrs['postpone']

    this.default = branch instanceof SkillBranch ? branch : branch.default

    this.record = {
      attrs: {
        overwrite: [],
        append: [],
        remove: [],
      },
      stats: {
        overwrite: [],
        append: [],
        remove: [],
      },
    }

    this._historyRecord = null
  }

  get name(): SkillBranchNames {
    if (this._inherit !== null) {
      return this._inherit
    }
    return this._name
  }

  set name(value: SkillBranchNames) {
    if (value === SkillBranchNames.Next) {
      this._inherit = SkillBranchNames.Effect
    }
    this._name = value
  }

  get realName(): SkillBranchNames {
    return this._name
  }

  get belongContainer() {
    return this.parent.parent.parent
  }

  get allAttrs() {
    return this._attrs
  }

  attr(key: string): string {
    return this._attrs[key] || ''
  }

  attrNumber(key: string): number {
    const attr = parseInt(this._attrs[key], 10)
    return Number.isNaN(attr) ? 0 : attr
  }

  attrBoolean(key: string): boolean {
    return this._attrs[key] === '1'
  }

  hasAttr(key: string) {
    return this._attrs[key] !== undefined
  }

  setAttr(key: string, value: string) {
    this._attrs[key] = value
  }

  removeAttr(key: string) {
    delete this._attrs[key]
  }

  clearAttr() {
    this._attrs = {}
  }

  checkBranchName(name: SkillBranchNames) {
    return this.name === name
  }

  syncRecord(record: SkillBranchItemOverwriteRecords) {
    this.record.attrs.overwrite = record.attrs.overwrite.slice()
    this.record.attrs.append = record.attrs.append.slice()
    this.record.attrs.remove = record.attrs.remove.slice()

    this.record.stats.overwrite = record.stats.overwrite.map(item => item.slice() as [string, StatTypes])
    this.record.stats.append = record.stats.append.map(item => item.slice() as [string, StatTypes])
    this.record.stats.remove = record.stats.remove.map(item => item.slice() as [string, StatTypes])
  }

  setHistoryRecord(record: SkillBranchItemOverwriteRecords) {
    this._historyRecord = record
  }

  get historyRecord() {
    return this._historyRecord
  }
}

class SkillBranchItem<Parent extends SkillEffectItemBase = SkillEffectItemBase> extends SkillBranchItemBase<Parent> {
  readonly suffixBranches: SkillBranchItemSuffix[]
  readonly linkedStackIds: number[]
  readonly stackId: number | null

  groupState: BranchGroupState

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    super(parent, branch)

    this.suffixBranches = markRaw([])

    this.stackId = this.name === SkillBranchNames.Stack ? this.attrNumber('id') : null

    this.linkedStackIds = this.stackId !== null ? [] :
      this.attr('stack_id').split(/\s*,\s*/).map(id => parseInt(id, 10))

    this.groupState = {
      size: 0,
      expandable: false,
      expanded: true,
      parentExpanded: true,
      isGroupEnd: false,
    }
  }

  get isGroup(): boolean {
    return this.groupState.size > 0
  }

  /**
   * Toggle expanded of group state of item
   * @param root - whether this item is called from external
   * @param [force]
   */
  toggleGroupExpanded(root: boolean, force?: boolean | null) {
    force = force ?? !this.groupState.expanded
    if (this.isGroup) {
      const { branchItems } = this.parent
      const idx = branchItems.indexOf(this)
      let remain = this.groupState.size
      let cur = idx + 1
      let bitem: SkillBranchItem | null = null
      while (cur < branchItems.length && remain !== 0) {
        bitem = branchItems[cur]
        bitem.toggleGroupExpanded(false, force)
        cur += bitem.groupState.size + 1
        remain -= 1
      }
      if (bitem) {
        bitem.groupState.isGroupEnd = force
      }
    }
    if (!root) {
      this.groupState.parentExpanded = force
      this.groupState.isGroupEnd = false
    } else {
      this.groupState.expanded = force
    }
  }

  toSuffix(mainBranch: SkillBranchItem): SkillBranchItemSuffix {
    const suffix = new SkillBranchItemSuffix(this.parent, this, mainBranch)
    suffix.syncRecord(this.record)
    return suffix
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(parent?: TargetParent): SkillBranchItem<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    const clone = new SkillBranchItem(parent, this)

    clone.suffixBranches.push(...this.suffixBranches.map(suf => suf.clone(parent)))

    return clone
  }
}

class SkillBranchItemSuffix<Parent extends SkillEffectItemBase = SkillEffectItemBase> extends SkillBranchItemBase<Parent> {
  readonly mainBranch: SkillBranchItem

  constructor(parent: Parent, branch: SkillBranchItemBase, mainBranch: SkillBranchItem) {
    super(parent, branch)

    this.mainBranch = mainBranch
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(parent?: TargetParent): SkillBranchItemSuffix<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    return new SkillBranchItemSuffix(parent, this, this.mainBranch)
  }
}

type SkillBranchItemBaseChilds = SkillBranchItem | SkillBranchItemSuffix

export default SkillComputingContainer

export {
  SkillItem,
  SkillEffectItem,
  SkillEffectItemHistory,
  SkillBranchItem,
  SkillBranchItemSuffix,
}

export type {
  SkillEffectItemBase,
  SkillBranchItemBaseChilds,
  EquipmentRestriction,
  BranchGroupState,
  BranchStackState,
  SkillBranchItemOverwriteRecords,
}
