import { SkillBranchNames } from '../Skill'
import type { SkillBranchItem, SkillBranchItemBaseChilds } from './SkillBranchItem'

/** Include derived properties and companion formulas before preparing indexed variables. */
export function collectBranchFormulaValues(
  branchItem: SkillBranchItemBaseChilds,
  props: ReadonlyMap<string, string>
): string[] {
  return [...props.values(), ...branchItem.stats.map(stat => stat.value)]
}

export function resolveStackDefaultValue(props: ReadonlyMap<string, string>): string {
  return (props.get('default') === 'auto' ? props.get('min') : props.get('default')) ?? ''
}

export function resolveStackName(branch: SkillBranchItem, defaultName: string): string {
  const name = branch.prop('name')
  if (name !== 'auto') {
    return name
  }
  const index = branch.parent.branchItems
    .filter(item => item.is(SkillBranchNames.Stack))
    .findIndex(item => item === branch || item.stackId === branch.stackId)
  return `${defaultName}${Math.max(index, 0) + 1}`
}

export function resolveProrationValue(props: ReadonlyMap<string, string>): string {
  return (props.get('proration') === 'auto' ? props.get('damage') : props.get('proration')) ?? ''
}

export function isSkillRangeKeyword(value: string): boolean {
  return ['main', 'no_limit', 'magic_device', 'katana', 'knuckle'].includes(value)
}
