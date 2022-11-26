import {
  SkillBranchItem,
  SkillEffectItem,
} from '@/lib/Skill/SkillComputingContainer'

export function setStackValue(branchItem: SkillBranchItem, value: number) {
  const stackId = branchItem.stackId
  if (typeof stackId !== 'number') {
    return
  }
  const effect = branchItem.parent
  if (effect instanceof SkillEffectItem) {
    effect.parent.effectItems.forEach(effectItem => {
      const stackState = effectItem.getStackState(stackId)
      if (stackState) {
        stackState.value = value
      }
    })
  }
}
