import { StatBase } from './StatBase'
import { StatTypes } from './enums'

export function getSelectableStats(stats: StatBase[]): StatBase[] {
  return stats.filter(stat => !stat.hidden)
}

export function getSelectableStatTypes(stat: StatBase): StatTypes[] {
  return stat.hasMultiplier ? [StatTypes.Constant, StatTypes.Multiplier] : [StatTypes.Constant]
}
