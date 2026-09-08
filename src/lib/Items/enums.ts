export const MaterialTypes = {
  Metal: 0,
  Beast: 1,
  Wood: 2,
  Cloth: 3,
  Medicine: 4,
  Mana: 5,
} as const
export type MaterialTypes = (typeof MaterialTypes)[keyof typeof MaterialTypes]
