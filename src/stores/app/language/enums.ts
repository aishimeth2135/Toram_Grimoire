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
}

export type LocaleNamespaces = LocaleGlobalNamespaces | LocaleViewNamespaces
