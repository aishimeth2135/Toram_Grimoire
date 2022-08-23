import type { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'
import { ResultContainerBase, ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import type { SkillDisplayData } from '.'

let _autoIncreasement = 0
export default class _DisplayDataContainer<Branch extends SkillBranchItemBaseChilds = SkillBranchItemBaseChilds> {
  private _value: SkillDisplayData
  private _customDatas!: Record<string, any>

  readonly instanceId: number

  readonly branchItem: Branch
  readonly containers: Record<string, ResultContainerBase>
  readonly statContainers: ResultContainerStat[]

  constructor({ branchItem, containers, statContainers, value }: {
    branchItem: Branch;
    containers: Record<string, ResultContainerBase>;
    statContainers: ResultContainerStat[];
    value: SkillDisplayData;
  }) {
    this.instanceId = _autoIncreasement
    _autoIncreasement += 1

    this.branchItem = branchItem
    this.containers = containers
    this.statContainers = statContainers
    this._value = value
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
