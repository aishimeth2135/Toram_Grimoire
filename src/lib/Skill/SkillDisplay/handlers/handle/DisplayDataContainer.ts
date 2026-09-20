import type { SkillDisplayData } from '.'

import {
  type InstanceId,
  InstanceIdGenerator,
  type InstanceWithId,
} from '@/shared/services/InstanceId'

import {
  type SkillBranchItemBaseChilds,
  type SkillBranchResultBase,
  SkillBranchStatResult,
} from '@/lib/Skill/SkillComputing'

export interface HealExtraItem {
  key: string
  text: string
}

interface DisplayCustomData {
  healExtraItems: HealExtraItem[]
}

export default class DisplayDataContainer<
  Branch extends SkillBranchItemBaseChilds = SkillBranchItemBaseChilds,
> implements InstanceWithId {
  private static _idGenerator = new InstanceIdGenerator()

  private _titles: SkillDisplayData
  private _customDatas: DisplayCustomData

  readonly instanceId: InstanceId

  readonly branchItem: Branch
  readonly containers: Map<string, SkillBranchResultBase>
  readonly computedValues: ReadonlyMap<string, SkillBranchResultBase>
  readonly statContainers: SkillBranchStatResult[]

  constructor({
    branchItem,
    containers = new Map(),
    statContainers = [],
    titles = new Map(),
    computedValues = new Map(),
  }: {
    branchItem: Branch
    containers?: Map<string, SkillBranchResultBase>
    statContainers?: SkillBranchStatResult[]
    titles?: SkillDisplayData
    computedValues?: ReadonlyMap<string, SkillBranchResultBase>
  }) {
    this.instanceId = DisplayDataContainer._idGenerator.generate()

    this.branchItem = branchItem
    this.containers = containers
    this.computedValues = computedValues
    this.statContainers = statContainers
    this._titles = titles
    this._customDatas = { healExtraItems: [] }
  }

  result(key: string) {
    return this.containers.get(key) ?? null
  }

  setResult(key: string, result: SkillBranchResultBase, title?: string): void {
    this.containers.set(key, result)
    if (title !== undefined) {
      this._titles.set(key, title)
    }
  }

  get(key: string): string {
    return this.containers.get(key)?.result ?? ''
  }

  has(key: string): boolean {
    return this.containers.get(key) !== undefined
  }

  getValue(key: string): string {
    return (this.computedValues.get(key) ?? this.containers.get(key))?.value ?? ''
  }

  getValueSum(key: string): number {
    return (this.computedValues.get(key) ?? this.containers.get(key))?.valueSum ?? 0
  }

  getOrigin(key: string): string {
    return this.containers.get(key)?.origin ?? ''
  }

  title(key: string) {
    return this._titles.get(key) ?? ''
  }

  setCustomData<Key extends keyof DisplayCustomData>(
    key: Key,
    value: DisplayCustomData[Key]
  ): void {
    this._customDatas[key] = value
  }

  getCustomData<Key extends keyof DisplayCustomData>(key: Key): DisplayCustomData[Key] {
    return this._customDatas[key]
  }
}
