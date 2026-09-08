export const QuestItemType = {
  Mob: 'mob',
  Item: 'item',
} as const
export type QuestItemType = (typeof QuestItemType)[keyof typeof QuestItemType]
