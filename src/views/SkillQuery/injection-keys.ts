import { InjectionKey } from 'vue'

import SkillComputingContainer, { SkillBranchItemBaseChilds } from '@/lib/Skill/SkillComputingContainer'

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItemBaseChilds, value: number) => void;
  rootComputingContainer: SkillComputingContainer;
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol('skill-computing-container')

export { ComputingContainerInjectionKey }


