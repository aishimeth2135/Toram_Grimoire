import type { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'
import {
  SkillBranchResultBase,
  SkillBranchStatResult,
} from '@/lib/Skill/SkillComputingContainer/SkillBranchResult'

import type { SkillDisplayData } from '.'

let _autoIncreasement = 0
export default class _DisplayDataContainer<
  Branch extends SkillBranchItemBaseChilds = SkillBranchItemBaseChilds
> {
  private _value: SkillDisplayData
  private _customDatas!: Record<string, any>

  readonly instanceId: number

  readonly branchItem: Branch
  readonly containers: Record<string, SkillBranchResultBase>
  readonly statContainers: SkillBranchStatResult[]

  constructor({
    branchItem,
    containers,
    statContainers,
    value,
  }: {
    branchItem: Branch
    containers: Record<string, SkillBranchResultBase>
    statContainers: SkillBranchStatResult[]
    value: SkillDisplayData
  }) {
    this.instanceId = _autoIncreasement
    _autoIncreasement += 1

    this.branchItem = branchItem
    this.containers = containers
    this.statContainers = statContainers
    this._value = value
  }

  result(key: string) {
    return this.containers[key] ?? null
  }

  get(key: string): string {
    return this._value[key]
  }

  has(key: string): boolean {
    return this._value[key] !== undefined
  }

  getValue(key: string): string {
    return this.containers[key]?.value ?? ''
  }

  getOrigin(key: string): string {
    return this.containers[key]?.origin ?? ''
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
