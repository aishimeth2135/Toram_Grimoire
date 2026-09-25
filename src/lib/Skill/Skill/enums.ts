export const SkillTypes = {
  Damage: 'damage',
  Active: 'active',
  Passive: 'passive',
} as const
export type SkillTypes = (typeof SkillTypes)[keyof typeof SkillTypes]

export const SkillBranchNames = {
  Damage: 'damage',
  Effect: 'effect',
  Buff: 'buff',
  Next: 'next',
  Heal: 'heal',
  Passive: 'passive',
  Stack: 'stack',
  Proration: 'proration',
  Text: 'text',
  List: 'list',
  Tips: 'tips',
  Reference: 'reference',
  Import: 'import',

  //
  Extend: 'extend',

  //
  Table: 'table',
  Row: 'row',

  //
  Basic: 'basic',

  // main branch: @damage, @effect, @buff, @next, @passive
  Extra: 'extra',

  // main branch: @damage
  Base: 'base',
  DamageHit: 'damage_hit',
  DamageStat: 'damage_stat',
  DamageSource: 'damage_source',

  // main branch: all
  Group: 'group',
  Space: 'space',
  FormulaExtra: 'formula_extra',

  // virtual branch for effect
  Equipment: 'equipment',

  None: '',
} as const
export type SkillBranchNames = (typeof SkillBranchNames)[keyof typeof SkillBranchNames]
