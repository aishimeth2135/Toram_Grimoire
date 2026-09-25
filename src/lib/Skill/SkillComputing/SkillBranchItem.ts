import { markRaw, reactive } from 'vue'

import {
  type InstanceId,
  InstanceIdGenerator,
  type InstanceWithId,
} from '@/shared/services/InstanceId'
import { toInt } from '@/shared/utils/number'

import { StatComputed, StatTypes } from '@/lib/Character/Stat'

import { parseBooleanProperty } from '../Properties/Boolean'
import { createIterablePropertyKey } from '../Properties/Iterable'
import { parseListProperty } from '../Properties/List'
import { SkillBranch } from '../Skill/SkillElement'
import { SkillBranchNames } from '../Skill/enums'
import { SkillBranchBuffs } from './SkillBranchBuffs'
import type { BranchGroupState, SkillEffectItem, SkillEffectItemBase } from './SkillEffectItem'
import { getBranchKindChain, getBranchTranslationKey } from './branchKinds'

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
  Parent extends SkillEffectItemBase = SkillEffectItemBase,
> implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()

  readonly instanceId: InstanceId

  private _props: Map<string, string>

  private kind: SkillBranchNames

  // -1 means undefined
  readonly overrideId: number

  readonly effectBranchId: string

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
  protected constructor(parent: Parent, branch: SkillBranch | SkillBranchItemBase) {
    this.instanceId = SkillBranchItemBase._idGenerator.generate()
    this.parent = parent
    this.overrideId = branch.overrideId

    this.kind = SkillBranchItemBase.sourceKind(branch)

    this._props = new Map(branch instanceof SkillBranch ? branch.props : branch.allProps)
    this.stats = branch.stats.map(stat => stat.clone())
    this.buffs = branch instanceof SkillBranch ? null : branch.buffs

    this.isEmpty = branch.isEmpty

    this.postpone = false
    this._initPostponeByProp()

    this.default = branch instanceof SkillBranch ? branch : branch.default
    this.effectBranchId = `${this.parent.effectId}-${this.default.getIndexId()}`

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

  _initPostponeByProp() {
    this.postpone = this._props.get('postpone') === '1'
  }

  private static sourceKind(branch: SkillBranch | SkillBranchItemBase): SkillBranchNames {
    return branch instanceof SkillBranch ? branch.name : branch.kind
  }

  /** Compare identity without considering inherited behavior. */
  isKindEquals(branch: SkillBranch | SkillBranchItemBase): boolean {
    return this.kind === SkillBranchItemBase.sourceKind(branch)
  }

  copyKindFrom(branch: SkillBranch | SkillBranchItemBase) {
    this.kind = SkillBranchItemBase.sourceKind(branch)
  }

  /** Match only this kind's dedicated behavior. */
  isExactly(kind: SkillBranchNames): boolean {
    return this.kind === kind
  }

  /** Match this kind or any ancestor. */
  isA(kind: SkillBranchNames): boolean {
    return getBranchKindChain(this.kind).includes(kind)
  }

  /** Identity key for diagnostics; not an inherited behavior selector. */
  getKindKey(): string {
    return this.kind
  }

  getTranslationKey(): string {
    return getBranchTranslationKey(this.kind)
  }

  /** Select the nearest definition, starting with this kind. */
  resolveKindConfig<T>(definitions: Partial<Record<SkillBranchNames, T>>): T | undefined {
    for (const kind of getBranchKindChain(this.kind)) {
      const value = definitions[kind]
      if (value !== undefined) {
        return value
      }
    }
    return undefined
  }

  /** Collect definitions from the oldest ancestor to this kind. */
  collectKindConfigs<T>(definitions: Partial<Record<SkillBranchNames, T>>): T[] {
    return getBranchKindChain(this.kind)
      .reverse()
      .flatMap(kind => {
        const value = definitions[kind]
        return value === undefined ? [] : [value]
      })
  }

  get allProps(): Map<string, string> {
    return this._props
  }

  get defaultBranchId(): string {
    return this.default.branchId
  }

  hasId(): boolean {
    return this.overrideId !== -1
  }

  propKey(...keys: string[]) {
    return createIterablePropertyKey(...keys)
  }

  prop(...keys: string[]): string {
    return this._props.get(this.propKey(...keys)) ?? ''
  }

  propNumber(...keys: string[]): number {
    return toInt(this._props.get(this.propKey(...keys))) ?? 0
  }

  propBoolean(...keys: string[]): boolean {
    return parseBooleanProperty(this._props.get(this.propKey(...keys)))
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

  syncRecord(record: SkillBranchItemOverwriteRecords) {
    this.record.props.overwrite = record.props.overwrite.slice()
    this.record.props.append = record.props.append.slice()
    this.record.props.remove = record.props.remove.slice()

    this.record.stats.overwrite = record.stats.overwrite.map(
      item => item.slice() as [string, StatTypes]
    )
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

class SkillBranchItem<
  Parent extends SkillEffectItemBase = SkillEffectItemBase,
> extends SkillBranchItemBase<Parent> {
  readonly suffixBranches: SkillBranchItemSuffix[]
  readonly emptySuffixBranches: SkillBranchItemSuffix[]
  linkedStackIds: number[]
  stackId: number | null
  effectStackId: string | null

  readonly groupState: BranchGroupState

  private constructor(
    parent: Parent,
    branch: SkillBranch | SkillBranchItem,
    groupState: BranchGroupState
  ) {
    super(parent, branch)

    this.suffixBranches = []
    this.emptySuffixBranches = []

    this.stackId = null
    this.effectStackId = null
    this.linkedStackIds = []
    this._initDatasByProp()

    this.groupState = groupState
  }

  static create<Parent extends SkillEffectItemBase = SkillEffectItemBase>(
    parent: Parent,
    branch: SkillBranch | SkillBranchItem
  ): SkillBranchItem<Parent> {
    const groupState = reactive<BranchGroupState>({
      size: 0,
      expandable: false,
      expanded: true,
      parentExpanded: true,
      isGroupEnd: false,
    })
    return markRaw(new SkillBranchItem(parent, branch, groupState))
  }

  _initDatasByProp() {
    this._initPostponeByProp()
    this.stackId = this.isA(SkillBranchNames.Stack) ? this.propNumber('id') : null
    this.effectStackId = this.stackId === null ? null : `${this.parent.effectId}-${this.stackId}`
    this.linkedStackIds =
      this.stackId !== null
        ? []
        : parseListProperty(this.prop('stack_id')).map(id => toInt(id) ?? 0)
  }

  get isGroup(): boolean {
    return this.groupState.size > 0
  }

  /**
   * Handle toggling expanded of group state of item
   * @param isRoot - Whether this item is called from group head
   */
  private _toggleGroupExpanded(isRoot: boolean, force?: boolean) {
    force = force ?? !this.groupState.expanded
    if (this.isGroup) {
      const { branchItems } = this.parent
      const idx = branchItems.indexOf(this)
      let remain = this.groupState.size
      let cur = idx + 1
      let bitem: SkillBranchItem | null = null
      while (cur < branchItems.length && remain !== 0) {
        bitem = branchItems[cur]
        bitem._toggleGroupExpanded(false, force)
        cur += bitem.groupState.size + 1
        remain -= 1
      }
      if (bitem) {
        bitem.groupState.isGroupEnd = force
      }
    }
    if (!isRoot) {
      this.groupState.parentExpanded = force
      this.groupState.isGroupEnd = false
    } else {
      this.groupState.expanded = force
    }
  }

  toggleGroupExpanded(force?: boolean) {
    this._toggleGroupExpanded(true, force)
  }

  initGroupExpaneded() {
    this._toggleGroupExpanded(true, this.groupState.expanded)
  }

  toSuffix(mainBranch: SkillBranchItem): SkillBranchItemSuffix {
    const suffix = SkillBranchItemSuffix.create(this.parent, this, mainBranch)
    suffix.syncRecord(this.record)
    return suffix
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(
    parent?: TargetParent
  ): SkillBranchItem<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    const clone = SkillBranchItem.create(parent, this)

    clone.suffixBranches.push(...this.suffixBranches.map(suf => suf.clone(parent, clone)))
    clone.emptySuffixBranches.push(...this.emptySuffixBranches.map(suf => suf.clone(parent, clone)))

    return clone
  }
}

class SkillBranchItemSuffix<
  Parent extends SkillEffectItemBase = SkillEffectItemBase,
> extends SkillBranchItemBase<Parent> {
  readonly mainBranch: SkillBranchItem

  private constructor(parent: Parent, branch: SkillBranchItemBase, mainBranch: SkillBranchItem) {
    super(parent, branch)

    this.mainBranch = mainBranch
  }

  static create<Parent extends SkillEffectItemBase = SkillEffectItemBase>(
    parent: Parent,
    branch: SkillBranchItemBase,
    mainBranch: SkillBranchItem
  ): SkillBranchItemSuffix<Parent> {
    return markRaw(new SkillBranchItemSuffix(parent, branch, mainBranch))
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(
    parent?: TargetParent,
    mainBranch: SkillBranchItem = this.mainBranch
  ): SkillBranchItemSuffix<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    return SkillBranchItemSuffix.create(parent, this, mainBranch)
  }
}

type SkillBranchItemBaseChilds = SkillBranchItem | SkillBranchItemSuffix

export { SkillBranchItem, SkillBranchItemSuffix }
export type { SkillBranchItemBaseChilds, SkillBranchItemOverwriteRecords }
