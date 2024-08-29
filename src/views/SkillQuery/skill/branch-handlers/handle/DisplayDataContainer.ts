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

export default class DisplayDataContainer<
  Branch extends SkillBranchItemBaseChilds = SkillBranchItemBaseChilds,
> implements InstanceWithId
{
  private static _idGenerator = new InstanceIdGenerator()

  private _titles: SkillDisplayData
  private _customDatas!: Record<string, any>

  readonly instanceId: InstanceId

  readonly branchItem: Branch
  readonly containers: Map<string, SkillBranchResultBase>
  readonly statContainers: SkillBranchStatResult[]

  constructor({
    branchItem,
    containers = new Map(),
    statContainers = [],
    titles = new Map(),
  }: {
    branchItem: Branch
    containers?: Map<string, SkillBranchResultBase>
    statContainers?: SkillBranchStatResult[]
    titles?: SkillDisplayData
  }) {
    this.instanceId = DisplayDataContainer._idGenerator.generate()

    this.branchItem = branchItem
    this.containers = containers
    this.statContainers = statContainers
    this._titles = titles
  }

  result(key: string) {
    return this.containers.get(key) ?? null
  }

  get(key: string): string {
    return this.containers.get(key)?.result ?? ''
  }

  has(key: string): boolean {
    return this.containers.get(key) !== undefined
  }

  getValue(key: string): string {
    return this.containers.get(key)?.value ?? ''
  }

  getValueSum(key: string): number {
    return this.containers.get(key)?.valueSum ?? 0
  }

  getOrigin(key: string): string {
    return this.containers.get(key)?.origin ?? ''
  }

  title(key: string) {
    return this._titles.get(key) ?? ''
  }

  setCustomData(key: string, value: any): void {
    if (!this._customDatas) {
      this._customDatas = {}
    }
    this._customDatas[key] = value
  }

  getCustomData(key: string): any {
    return this._customDatas?.[key]
  }
}
