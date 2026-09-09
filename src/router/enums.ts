export const AppRouteNames = {
  Base: 'Base',

  Home: 'Home',
  About: 'About',

  Skill: 'Skill',
  SkillQuery: 'SkillQuery',

  Items: 'items',
  ItemQuery: 'ItemQuery',
  CrystalQuery: 'CrystalQuery',

  Enchant: 'Enchant',
  EnchantSimulator: 'EnchantSimulator',
  EnchantDoll: 'EnchantDoll',

  Character: 'Character',
  CharacterSimulator: 'CharacterSimulator',
  // SkillSimulator: 'SkillSimulator',

  DamageCalculationBase: 'DamageCalculationBase',
  DamageCalculation: 'DamageCalculation',

  Glossary: 'Glossary',
  GlossaryQuery: 'GlossaryQuery',

  Trait: 'Trait',
  TraitQuery: 'TraitQuery',

  Registlet: 'Registlet',
  RegistletQuery: 'RegistletQuery',

  Quest: 'Quest',
  MainQuestCalc: 'MainQuestCalc',

  Book: 'Book',
  BookView: 'BookView',
  BookPreview: 'BookPreview',

  Bubble: 'Bubble',

  UnrecognizedPath: 'UnrecognizedPath',
} as const
export type AppRouteNames = (typeof AppRouteNames)[keyof typeof AppRouteNames]
