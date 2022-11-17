import { InjectionKey } from 'vue'

import { Skill } from '@/lib/Skill/Skill'
import SkillComputingContainer, {
  SkillBranchItem,
} from '@/lib/Skill/SkillComputingContainer'

import { SkillRegistletItemState } from './setup'

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItem, value: number) => void
  rootComputingContainer: SkillComputingContainer
  getSkillRegistletItemsState: (sklll: Skill) => SkillRegistletItemState[]
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> =
  Symbol('skill-computing-container')

export { ComputingContainerInjectionKey }
