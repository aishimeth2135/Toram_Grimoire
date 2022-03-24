export const enum LocaleGlobalNamespaces {
  App = 'app',
  Common = 'common',
  Global = 'global',
}

export const enum LocaleViewNamespaces {
  SkillQuery = 'skill-query',
  DamageCalculation = 'damage-calculation',
  SkillSimulator = 'skill-simulator',
  CharacterSimulator = 'character-simulator',
  EnchantSimulator = 'enchant-simulator',
  EnchantDoll = 'enchant-doll',
}

export type LocaleNamespaces = LocaleGlobalNamespaces | LocaleViewNamespaces
