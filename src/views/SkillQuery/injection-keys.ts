import { InjectionKey } from 'vue'

import { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItemBaseChilds, value: number) => void;
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol('skill-computing-container')

export { ComputingContainerInjectionKey }


