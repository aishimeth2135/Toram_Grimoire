import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import { ResultContainerBase, ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer';

import type { SkillDisplayData } from '.';

export default class DisplayDataContainer {
  private _value: SkillDisplayData;

  readonly branchItem: SkillBranchItem;
  readonly containers: Record<string, ResultContainerBase>;
  readonly statContainers: ResultContainerStat[];
  readonly customDatas: Record<string, any>;

  constructor({ branchItem, containers, statContainers, value }: {
    branchItem: SkillBranchItem;
    containers: Record<string, ResultContainerBase>;
    statContainers: ResultContainerStat[];
    value: SkillDisplayData;
  }) {
    this.branchItem = branchItem;
    this.containers = containers;
    this.statContainers = statContainers;
    this._value = value;
    this.customDatas = {};
  }

  get(key: string): string {
    return this._value[key];
  }
}
