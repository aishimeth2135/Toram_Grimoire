export const EnemyElements = {
  Neutral: 'neutral',
  Fire: 'fire',
  Water: 'water',
  Earth: 'earth',
  Wind: 'wind',
  Dark: 'dark',
  Light: 'light',
} as const
export type EnemyElements = (typeof EnemyElements)[keyof typeof EnemyElements]
