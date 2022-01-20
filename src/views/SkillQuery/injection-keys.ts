import { InjectionKey } from 'vue'

import { SkillBranchItemBase } from '@/lib/Skill/SkillComputingContainer'

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItemBase, value: number) => void;
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol('skill-computing-container')

export { ComputingContainerInjectionKey }


