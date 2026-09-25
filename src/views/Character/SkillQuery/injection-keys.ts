import type { InjectionKey, Ref } from 'vue'

import type { RegistletItemBaseSkill } from '@/lib/Registlet/RegistletItem'
import { Skill } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillComputingContainer,
  SkillEffectItem,
  SkillItem,
} from '@/lib/Skill/SkillComputing'

interface SkillRegistletItemState {
  readonly item: RegistletItemBaseSkill
  readonly level: number
  readonly enabled: boolean
  setLevel?: (level: number) => void
  setEnabled?: (enabled: boolean) => void
}

interface ComputingContainerInjection {
  setStackValue: (branchItem: SkillBranchItem, value: number) => void
  rootComputingContainer: SkillComputingContainer
  currentSkillItem: Ref<SkillItem | null>
  getSkillRegistletItemsState: (skill: Skill) => SkillRegistletItemState[]
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol(
  'skill-computing-container'
)

interface SkillEffectInjection {
  currentEffectItem: Ref<SkillEffectItem>
}
const SkillEffectInjectionKey: InjectionKey<SkillEffectInjection> = Symbol('skill-effect')

const SkillEffectNavigationInjectionKey: InjectionKey<(skill: Skill) => void> =
  Symbol('skill-effect-navigation')

export {
  ComputingContainerInjectionKey,
  SkillEffectInjectionKey,
  SkillEffectNavigationInjectionKey,
}

export type { SkillEffectInjection, ComputingContainerInjection, SkillRegistletItemState }
