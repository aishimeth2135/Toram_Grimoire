import { InjectionKey, Ref } from 'vue'

import { Skill } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillComputingContainer,
  SkillEffectItem,
  SkillItem,
} from '@/lib/Skill/SkillComputing'

import type { SkillRegistletItemState } from './setup'

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItem, value: number) => void
  rootComputingContainer: SkillComputingContainer
  currentSkillItem: Ref<SkillItem | null>
  getSkillRegistletItemsState: (sklll: Skill) => SkillRegistletItemState[]
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> =
  Symbol('skill-computing-container')

interface SkillEffectInjection {
  currentEffectItem: Ref<SkillEffectItem | null>
}
const SkillEffectInjectionKey: InjectionKey<SkillEffectInjection> =
  Symbol('skill-effect')

export { ComputingContainerInjectionKey, SkillEffectInjectionKey }

export type { SkillEffectInjection, ComputingContainerInjection }
