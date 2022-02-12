import { SkillBranchItem, SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'

import { findStackState } from '@/views/SkillQuery/utils'

export function setStackValue(branchItem: SkillBranchItem, value: number) {
  const stackId = branchItem.stackId
  if (typeof stackId !== 'number') {
    return
  }
  const effect = branchItem.parent
  if (effect instanceof SkillEffectItem) {
    effect.parent.effectItems.forEach(effectItem => {
      const stackState = findStackState(effectItem, stackId)
      if (stackState) {
        stackState.value = value
      }
    })
  }
}
