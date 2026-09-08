export const CharacterComboTags = {
  Consecutive: 'consecutive',
  Smite: 'smite',
  Save: 'save',
  MindsEye: 'minds-eye',
  Tenacity: 'tenacity',
  Swift: 'swift',
  Invincible: 'invincible',
  Tough: 'tough',
  Reflection: 'reflection',
  Bloodsucker: 'bloodsucker',
} as const
export type CharacterComboTags = (typeof CharacterComboTags)[keyof typeof CharacterComboTags]
