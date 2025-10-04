import { reactive } from 'vue'

import {
  type InstanceId,
  InstanceIdGenerator,
  type InstanceWithId,
} from '@/shared/services/InstanceId'
import { toInt } from '@/shared/utils/number'
import { splitComma } from '@/shared/utils/string'

import { StatComputed, StatTypes } from '@/lib/Character/Stat'

import { SkillBranch } from '../Skill/SkillElement'
import { SkillBranchNames } from '../Skill/enums'
import { SkillBranchBuffs } from './SkillBranchBuffs'
import type { BranchGroupState, SkillEffectItem, SkillEffectItemBase } from './SkillEffectItem'

type SkillBranchItemOverwriteRecord<T> = {
  overwrite: T[]
  append: T[]
  remove: T[]
}
type SkillBranchItemOverwriteRecords = {
  props: SkillBranchItemOverwriteRecord<string>
  stats: SkillBranchItemOverwriteRecord<[string, StatTypes]>
}

abstract class SkillBranchItemBase<Parent extends SkillEffectItemBase = SkillEffectItemBase>
  implements InstanceWithId
{
  private static _idGenerator = new InstanceIdGenerator()

  readonly instanceId: InstanceId

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
    this.instanceId = SkillBranchItemBase._idGenerator.generate()
    this.parent = parent
    this.id = branch.id

    this._name = branch.name
    this._inherit = null
    this.name = this._name // init _inherit

    this._props = new Map(branch instanceof SkillBranch ? branch.props : branch.allProps)
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

  hasId(): boolean {
    return this.id !== -1
  }

  propKey(...keys: string[]) {
    return keys.join('.')
  }

  prop(...keys: string[]): string {
    return this._props.get(this.propKey(...keys)) ?? ''
  }

  propNumber(...keys: string[]): number {
    return toInt(this._props.get(this.propKey(...keys))) ?? 0
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

/**
 * @vue-reactive-raw
 */
class SkillBranchItem<
  Parent extends SkillEffectItemBase = SkillEffectItemBase,
> extends SkillBranchItemBase<Parent> {
  readonly suffixBranches: SkillBranchItemSuffix[]
  readonly emptySuffixBranches: SkillBranchItemSuffix[]
  readonly linkedStackIds: number[]
  readonly stackId: number | null

  readonly groupState: BranchGroupState

  constructor(parent: Parent, branch: SkillBranch | SkillBranchItem) {
    super(parent, branch)

    this.suffixBranches = []
    this.emptySuffixBranches = []

    this.stackId = this.name === SkillBranchNames.Stack ? this.propNumber('id') : null

    this.linkedStackIds =
      this.stackId !== null ? [] : splitComma(this.prop('stack_id')).map(id => toInt(id) ?? 0)

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
    const suffix = new SkillBranchItemSuffix(this.parent, this, mainBranch)
    suffix.syncRecord(this.record)
    return suffix
  }

  override clone<TargetParent extends SkillEffectItemBase = SkillEffectItem>(
    parent?: TargetParent
  ): SkillBranchItem<TargetParent> {
    parent = (parent ?? this.parent) as TargetParent
    const clone = new SkillBranchItem(parent, this)

    clone.suffixBranches.push(...this.suffixBranches.map(suf => suf.clone(parent)))

    return clone
  }
}

/**
 * @vue-reactive-raw
 */
class SkillBranchItemSuffix<
  Parent extends SkillEffectItemBase = SkillEffectItemBase,
> extends SkillBranchItemBase<Parent> {
  readonly mainBranch: SkillBranchItem

  constructor(parent: Parent, branch: SkillBranchItemBase, mainBranch: SkillBranchItem) {
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

type SkillBranchItemBaseChilds = SkillBranchItem | SkillBranchItemSuffix

export { SkillBranchItem, SkillBranchItemSuffix }
export type { SkillBranchItemBaseChilds, SkillBranchItemOverwriteRecords }
