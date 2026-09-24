import { getSkillStackState } from '@/stores/views/character/setup/getState'

import type { SkillBranchItem } from '@/lib/Skill/SkillComputing'

export function setStackValue(branchItem: SkillBranchItem, value: number) {
  const stackState = getSkillStackState(branchItem)
  if (stackState) {
    stackState.value = value
  }
}
