import type { SkillBranchItemBaseChilds } from './SkillBranchItem'

/** Include derived properties and companion formulas before preparing indexed variables. */
export function collectBranchFormulaValues(
  branchItem: SkillBranchItemBaseChilds,
  props: ReadonlyMap<string, string>
): string[] {
  return [...props.values(), ...branchItem.stats.map(stat => stat.value)]
}
