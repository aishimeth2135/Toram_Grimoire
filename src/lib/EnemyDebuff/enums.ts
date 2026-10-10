export const EnemyDebuffTypes = {
  Weaken: 'weaken',
  ArmorBreak: 'armor-break',
} as const
export type EnemyDebuffTypes = (typeof EnemyDebuffTypes)[keyof typeof EnemyDebuffTypes]
