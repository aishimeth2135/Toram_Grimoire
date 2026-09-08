export const LocaleGlobalNamespaces = {
  App: 'app',
  Common: 'common',
  Global: 'global',
} as const
export type LocaleGlobalNamespaces =
  (typeof LocaleGlobalNamespaces)[keyof typeof LocaleGlobalNamespaces]

export const LocaleViewNamespaces = {
  SkillQuery: 'skill-query',
  DamageCalculation: 'damage-calculation',
  SkillSimulator: 'skill-simulator',
  CharacterSimulator: 'character-simulator',
  EnchantSimulator: 'enchant-simulator',
  EnchantDoll: 'enchant-doll',
  CrystalQuery: 'crystal-query',
  ItemQuery: 'item-query',
  RegistletQuery: 'registlet-query',
  MainQuestCalc: 'main-quest-calc',
  EquipmentTrait: 'equipment-trait',
  BookTemplate: 'book-template',
} as const
export type LocaleViewNamespaces = (typeof LocaleViewNamespaces)[keyof typeof LocaleViewNamespaces]

export type LocaleNamespaces = LocaleGlobalNamespaces | LocaleViewNamespaces
