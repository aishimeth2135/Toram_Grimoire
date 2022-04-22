export const enum SkillTypes {
  Active = 'active',
  Passive = 'passive',
}

export const enum SkillBranchNames {
  Damage = 'damage',
  Effect = 'effect',
  Next = 'next',
  Heal = 'heal',
  Passive = 'passive',
  Stack = 'stack',
  Proration = 'proration',
  Text = 'text',
  List = 'list',
  Tips = 'tips',
  Reference = 'reference',
  Import = 'import',

  //
  Table = 'table',
  Row = 'row',

  //
  Basic = 'basic',

  // main branch: @damage, @effect, @next, @passive
  Extra = 'extra',

  // main branch: @damage
  Base = 'base',

  // main branch: all
  Group = 'group',
  Space = 'space',
  FormulaExtra = 'formula_extra',

  None = '',
}
