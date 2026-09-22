import { computeFormula } from '@/shared/utils/data'

import { SkillBranchNames } from '../../Skill'
import type { SkillBranchItem, SkillBranchItemSuffix } from '../../SkillComputing/SkillBranchItem'

interface DamageSourceConditionFormulaScope {
  $skill: {
    id: string
  }
  $branch: {
    from_normal_attack: boolean
  }
}

interface DamageSourceAmountFormulaScope {
  $self: {
    damage: number
  }
  $branch: {
    frequency: number
  }
}

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
  const scope: DamageSourceConditionFormulaScope = {
    $skill: { id: skillId },
    $branch: { from_normal_attack: target.propBoolean('from_normal_attack') },
  }
  return !!condition && computeFormula(condition, scope, false) === true
}

export function computeDamageSourceAmount(
  suffix: SkillBranchItemSuffix,
  damage: number,
  frequency: number
): number {
  const scope: DamageSourceAmountFormulaScope = {
    $self: { damage },
    $branch: { frequency },
  }
  const amount = computeFormula(suffix.prop('amount') || '0', scope, 0)
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
}
