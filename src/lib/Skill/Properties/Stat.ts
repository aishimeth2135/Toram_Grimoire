import type { StatElementBase } from '@/lib/Character/Stat'

export function getStatMainKey(stat: StatElementBase): string {
  return stat.statId
}
