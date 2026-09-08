export const RegistletCategoryIds = {
  Stat: 'stat',
  Special: 'special',
  Skill: 'skill',
} as const
export type RegistletCategoryIds = (typeof RegistletCategoryIds)[keyof typeof RegistletCategoryIds]
