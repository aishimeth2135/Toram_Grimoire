export const BookPageSectionTypes = {
  Detail: 'detail',
  Content: 'content',
  Equipment: 'equipment',
} as const
export type BookPageSectionTypes = (typeof BookPageSectionTypes)[keyof typeof BookPageSectionTypes]
