import type { LevelSkillTree, SkillRoot, SkillTree, SkillTreeCategory } from '@/lib/Skill/Skill'

export interface SkillBuildState {
  stateId: number
  name: string
  origin: SkillRoot
  skillTreeCategoryStates: SkillTreeCategoryState[]
}

export interface SkillTreeCategoryState {
  origin: SkillTreeCategory
  visible: boolean
  skillTreeStates: SkillTreeState[]
}

export interface SkillTreeState {
  origin: SkillTree
  levelSkillTree: LevelSkillTree
  visible: boolean
}
