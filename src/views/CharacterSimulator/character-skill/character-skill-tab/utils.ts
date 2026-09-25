import { useCharacterStore } from '@/stores/views/character'

import type { SkillBranchItem } from '@/lib/Skill/SkillComputing'

export function setStackValue(branchItem: SkillBranchItem, value: number) {
  const stackState =
    useCharacterStore().currentCharacterState.skillBuild?.getSkillStackState(branchItem)
  if (stackState) {
    stackState.value = value
  }
}
