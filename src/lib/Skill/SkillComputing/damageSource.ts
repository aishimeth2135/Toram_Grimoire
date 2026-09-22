import { computeFormula } from '@/shared/utils/data'

import { SkillBranchNames } from '../Skill'
import type { SkillBranchItem, SkillBranchItemSuffix } from './SkillBranchItem'

export function getDamageSource(branch: SkillBranchItem) {
  return branch.suffixBranches.find(suffix => suffix.is(SkillBranchNames.DamageSource))
}

export function matchesDamageSource(
  source: SkillBranchItem,
  target: SkillBranchItem,
  skillId: string
): boolean {
  const suffix = getDamageSource(source)
  if (source === target || suffix?.prop('type') !== 'additional') {
    return false
  }

  const condition = suffix.prop('conditionValue')
  return !!condition && computeFormula(condition, { $skill: { id: skillId } }, false) === true
}

export function computeDamageSourceAmount(
  suffix: SkillBranchItemSuffix,
  damage: number,
  frequency: number
): number {
  const amount = computeFormula(
    suffix.prop('amount') || '0',
    { $self: { damage }, $branch: { frequency } },
    0
  )
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
}
