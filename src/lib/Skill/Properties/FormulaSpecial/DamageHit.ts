import { SkillBranchNames } from '../../Skill'
import type { SkillBranchItem } from '../../SkillComputing/SkillBranchItem'

interface DamageHitFormulaScope {
  $currentHit: number
}

export function getDamageHit(branch: SkillBranchItem) {
  return branch.suffixBranches.find(suffix => suffix.isA(SkillBranchNames.DamageHit))
}

export function getDamageHitMultiplierFormula(branch: SkillBranchItem, currentHit: number) {
  const suffix = getDamageHit(branch)
  if (suffix?.prop('mode') !== 'multiplier' || !suffix.hasProp('multipliers')) {
    return null
  }

  const scope: DamageHitFormulaScope = { $currentHit: currentHit }
  return suffix.prop('multipliers').replace(/\$currentHit\b/g, String(scope.$currentHit))
}

export function getDamageFrequency(branch: SkillBranchItem, frequency: number): number {
  return getDamageHit(branch) ? 1 : frequency
}
