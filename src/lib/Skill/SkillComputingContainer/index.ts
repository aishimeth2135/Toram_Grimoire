import { reactive, shallowReactive } from 'vue'

import {
  HandleFormulaMethods,
  HandleFormulaTexts,
  HandleFormulaVars,
} from '@/shared/utils/data'
import { splitComma } from '@/shared/utils/string'

import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums'
import { StatComputed } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat/enums'

import { Skill, SkillBranch, SkillEffect, SkillEffectHistory } from '../Skill'
import { SkillBranchNames } from '../Skill/enums'
import { FormulaDisplayModes, SkillBuffs } from './enums'
import {
  convertEffectEquipment,
  effectOverwrite,
  handleVirtualBranches,
  initBasicBranchItem,
  initBranchSpecialProps,
  initBranchesPostpone,
  initHistoryNexts,
  initStackStates,
  normalizeBaseBranches,
  regressHistoryBranches,
  separateSuffixBranches,
  setBranchAttrsDefaultValue,
} from './utils'

interface HandleFormulaExtends {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods?: HandleFormulaMethods
}

interface SkillFormulaExtraProps {
  max: number | null
  min: number | null
}

/**
 * @vue-reactive controller
 */
class SkillComputingContainer {
  varGetters: {
    characterLevel: (() => number) | null
    skillLevel: ((skill: Skill) => number) | null
    registletLevel: ((skill: Skill) => number[]) | null
  }

  handleFormulaExtends: HandleFormulaExtends

  handleFormulaDynamicExtends: (() => HandleFormulaExtends)[]

  config: {
    formulaDisplayMode: FormulaDisplayModes
    getFormulaExtraValue:
      | ((
          branch: SkillBranchItem,
          id: string,
          props?: SkillFormulaExtraProps
        ) => number | null)
      | null
    computeFormulaExtraValue: ((formula: string) => number | null) | null
  }

  constructor() {
    this.varGetters = {
      characterLevel: null,
      skillLevel: null,
      registletLevel: null,
    }
    this.handleFormulaExtends = {
      vars: {},
      texts: {},
    }
    this.handleFormulaDynamicExtends = []
    this.config = shallowReactive({
      formulaDisplayMode: FormulaDisplayModes.Normal,
      getFormulaExtraValue: null,
      computeFormulaExtraValue: null,
    })
  }
}

/**
 * @vue-reactive raw
 */
class SkillItem {
  readonly skill: Skill
  readonly effectItems: SkillEffectItem[]

  constructor(skill: Skill) {
    this.skill = skill

    const defaultSef = skill.defaultEffect
    const otherSefs = skill.effects.filter(sef => sef !== defaultSef)
    this.effectItems = [
      new SkillEffectItem(this, defaultSef),
      ...otherSefs.map(sef => new SkillEffectItem(this, defaultSef, sef)),
    ]
  }

  findEffectItem(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ) {
    return (
      this.effectItems.find(effectItem =>
        effectItem.equipmentMatch(equipment, getSkillLevel)
      ) ?? null
    )
  }
}

interface EquipmentRestrictionsParam {
  main?: EquipmentTypes | null
  sub?: EquipmentTypes | null
  body?: EquipmentTypes | null
  other?: string | null
}

class EquipmentRestrictions {
  main: EquipmentTypes | null
  sub: EquipmentTypes | null
  body: EquipmentTypes | null
  other: string | null

  constructor({
    main = null,
    sub = null,
    body = null,
    other = null,
  }: EquipmentRestrictionsParam = {}) {
    this.main = main
    this.sub = sub
    this.body = body
    this.other = other
  }
}

type EquipmentRestrictionsBaseKeys = 'main' | 'sub' | 'body'

interface BranchGroupState {
  readonly size: number
  readonly expandable: boolean
  expanded: boolean
  parentExpanded: boolean
  isGroupEnd: boolean
}

interface BranchStackState {
  readonly stackId: number
  readonly branch: SkillBranchItem
  value: number
}

abstract class SkillEffectItemBase {
  abstract readonly branchItems: SkillBranchItem<SkillEffectItemBase>[]

  readonly parent: SkillItem

  // reactive: init in `initStackStates`
  readonly stackStates: BranchStackState[]

  constructor(parent: SkillItem) {
    this.parent = parent
    this.stackStates = []
  }

  getStackState(stackId: number) {
    return this.stackStates.find(state => state.stackId === stackId) ?? null
  }
}

/**
 * @vue-reactive raw
 */
class SkillEffectItem extends SkillEffectItemBase {
  override branchItems: SkillBranchItem<SkillEffectItem>[]

  readonly equipments: EquipmentRestrictions[]
  readonly historys: SkillEffectItemHistory[]

  basicBranchItem!: SkillBranchItem<SkillEffectItem>

  constructor(parent: SkillItem, defaultSef: SkillEffect, from?: SkillEffect) {
    super(parent)

    this.branchItems = normalizeBaseBranches(defaultSef.branches).map(
      bch => new SkillBranchItem(this, bch)
    )
    initBasicBranchItem(this, defaultSef)

    const current = from ? from : defaultSef
    const dualSwordRegress = defaultSef.parent.effects.every(
      eft => eft.mainWeapon !== 10
    )
    this.equipments = convertEffectEquipment(current, dualSwordRegress)

    this.historys = current.historys.map(
      history => new SkillEffectItemHistory(parent, this, history)
    )

    if (from) {
      effectOverwrite(this, from)
    }
    setBranchAttrsDefaultValue(this)
    initBranchSpecialProps(this)

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

  equipmentMatch(
    equipment: EquipmentRestrictions,
    getSkillLevel?: (skill: Skill) => number
  ): boolean {
    const equipments = this.equipments.slice()

    // 雙手合持 (0-6-11)
    if (getSkillLevel && this.parent.skill.skillId === '0-6-11') {
      // 忍道 (4-5-1)
      const skillNinjaSpirit =
        this.parent.skill.parent.parent.parent.findSkillById('4-5-1')
      if (skillNinjaSpirit) {
        const skillNinjaSpiritLevel = getSkillLevel(skillNinjaSpirit)
        if (skillNinjaSpiritLevel === 10) {
          const mainRest = equipments.find(
            rest => rest.main !== null && rest.sub === null
          )
          if (mainRest) {
            equipments.push(
              new EquipmentRestrictions({
                main: mainRest.main,
                sub: EquipmentTypes.NinjutsuScroll,
              })
            )
          }
        }
      }
    }

    return equipments.some(effectEquipment => {
      if (
        effectEquipment.main === null &&
        effectEquipment.sub === null &&
        effectEquipment.body === null
      ) {
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
    return this.equipments
      .map(equip => keys.map(key => equip[key] || 'none').join('+'))
      .join('/')
  }

  resetStackStates(vars: { slv: number; clv: number }) {
    this.historys.forEach(history => {
      initStackStates(history, vars)
    })
    initStackStates(this, vars)
  }
}

/**
 * @vue-reactive raw
 */
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

  constructor(
    parent: SkillItem,
    parentEffect: SkillEffectItem,
    historyEffect: SkillEffectHistory
  ) {
    super(parent)
    this.branchItems = normalizeBaseBranches(historyEffect.branches).map(
      bch => new SkillBranchItem(this, bch)
    )

    this.origin = historyEffect
    this.parentEffect = parentEffect
    this.date = historyEffect.date
    this.nexts = new Map()
    this.introductionBranches = []
    this.removedBranches = []
  }

  get modifiedBranchItems() {
    return this.branchItems.filter(branchItem => {
      if (
        branchItem.id !== -1 &&
        this.origin.branches.find(bch => bch.id === branchItem.id)
      ) {
        return true
      }
      return branchItem.suffixBranches.some(
        suffix =>
          suffix.id !== -1 &&
          this.origin.branches.find(bch => suffix.id === bch.id)
      )
    })
  }
}

type SkillBranchItemOverwriteRecord<T> = {
  overwrite: T[]
  append: T[]
  remove: T[]
}
type SkillBranchItemOverwriteRecords = {
  props: SkillBranchItemOverwriteRecord<string>
  stats: SkillBranchItemOverwriteRecord<[string, StatTypes]>
}
abstract class SkillBranchItemBase<
  Parent extends SkillEffectItemBase = SkillEffectItemBase
> {
  private static _incrementId = 0

  readonly instanceId: number

  private _props: Map<string, string>

  private _name: SkillBranchNames
  private _inherit: SkillBranchNames | null

  // -1 means undefined
  readonly id: number

  readonly parent: Parent
  readonly stats: StatComputed[]
  buffs: SkillBranchBuffs | null

  readonly isEmpty: boolean

  /**
   * (character-simulator only)
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
   * @param parent - parent SkillEffectItem
   * @param branch - branch from default effect of skill, branch should be overwrite later
   */
  constructor(parent: Parent, branch: SkillBranch | SkillBranchItemBase) {
    this.instanceId = SkillBranchItemBase._incrementId
    SkillBranchItemBase._incrementId += 1

    this.parent = parent
    this.id = branch.id

    this._name = branch.name
    this._inherit = null
    this.name = this._name // init _inherit

    this._props = new Map(
      branch instanceof SkillBranch ? branch.props : branch.allProps
    )
    this.stats = branch.stats.map(stat => stat.clone())
    this.buffs = null

    this.isEmpty = branch.isEmpty

    this.postpone = this._props.get('postpone') === '1'
    this._props.delete('postpone')

    this.default = branch instanceof SkillBranch ? branch : branch.default

    this.record = {
      props: {
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

  get allProps() {
    return this._props
  }

  propKey(...keys: string[]) {
    return keys.join('.')
  }

  prop(...keys: string[]): string {
    return this._props.get(this.propKey(...keys)) ?? ''
  }

  propNumber(...keys: string[]): number {
    const attr = parseInt(this._props.get(this.propKey(...keys)) ?? '', 10)
    return Number.isNaN(attr) ? 0 : attr
  }

  propBoolean(...keys: string[]): boolean {
    return this._props.get(this.propKey(...keys)) === '1'
  }

  hasProp(...keys: string[]) {
    return this._props.get(this.propKey(...keys)) !== undefined
  }

  setProp(key: string, value: string) {
    this._props.set(key, value)
  }

  removeProp(key: string) {
    this._props.delete(key)
  }

  clearProp() {
    this._props.clear()
  }

  is(name: SkillBranchNames) {
    return this.name === name || this._name === name
  }

  syncRecord(record: SkillBranchItemOverwriteRecords) {
    this.record.props.overwrite = record.props.overwrite.slice()
    this.record.props.append = record.props.append.slice()
    this.record.props.remove = record.props.remove.slice()

    this.record.stats.overwrite = record.stats.overwrite.map(
      item => item.slice() as [string, StatTypes]
    )
    this.record.stats.append = record.stats.append.map(
      item => item.slice() as [string, StatTypes]
    )
    this.record.stats.remove = record.stats.remove.map(
      item => item.slice() as [string, StatTypes]
    )
  }

  setHistoryRecord(record: SkillBranchItemOverwriteRecords) {
    this._historyRecord = record
  }

  get historyRecord() {
    return this._historyRecord
  }
}

/**
 * @vue-reactive raw
 */
class SkillBranchItem<
  Parent extends SkillEffectItemBase = SkillEffectItemBase
> extends SkillBranchItemBase<Parent> {
  readonly suffixBranches: SkillBranchItemSuffix[]
  readonly emptySuffixBranches: SkillBranchItemSuffix[]
  readonly linkedStackIds: number[]
  readonly stackId: number | null

  groupState: BranchGroupState

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    super(parent, branch)

    this.suffixBranches = []
    this.emptySuffixBranches = []

    this.stackId =
      this.name === SkillBranchNames.Stack ? this.propNumber('id') : null

    this.linkedStackIds =
      this.stackId !== null
        ? []
        : splitComma(this.prop('stack_id')).map(id => parseInt(id, 10))

    this.groupState = reactive({
      size: 0,
      expandable: false,
      expanded: true,
      parentExpanded: true,
      isGroupEnd: false,
    })
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

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(
    parent?: TargetParent
  ): SkillBranchItem<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    const clone = new SkillBranchItem(parent, this)

    clone.suffixBranches.push(
      ...this.suffixBranches.map(suf => suf.clone(parent))
    )

    return clone
  }
}

/**
 * @vue-reactive raw
 */
class SkillBranchItemSuffix<
  Parent extends SkillEffectItemBase = SkillEffectItemBase
> extends SkillBranchItemBase<Parent> {
  readonly mainBranch: SkillBranchItem

  constructor(
    parent: Parent,
    branch: SkillBranchItemBase,
    mainBranch: SkillBranchItem
  ) {
    super(parent, branch)

    this.mainBranch = mainBranch
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(
    parent?: TargetParent
  ): SkillBranchItemSuffix<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    return new SkillBranchItemSuffix(parent, this, this.mainBranch)
  }
}

/**
 * @vue-reactive raw
 */
class SkillBranchBuffs {
  private _buffs: Set<SkillBuffs>

  static SkillBuffList: SkillBuffs[] = [SkillBuffs.MpCostHalf]

  constructor(str: string) {
    this._buffs = new Set()
    ;(splitComma(str) as SkillBuffs[]).forEach(item => {
      if (SkillBranchBuffs.SkillBuffList.includes(item)) {
        this._buffs.add(item)
      }
    })
  }

  get items() {
    return [...this._buffs]
  }

  has(str: SkillBuffs) {
    return this._buffs.has(str)
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
  SkillBranchBuffs,
  EquipmentRestrictions,
}

export type {
  SkillEffectItemBase,
  SkillBranchItemBaseChilds,
  BranchGroupState,
  BranchStackState,
  SkillBranchItemOverwriteRecords,
  EquipmentRestrictionsBaseKeys,
  SkillFormulaExtraProps,
}
