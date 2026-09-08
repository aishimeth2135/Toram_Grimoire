export const EquipmentTraitCategory = {
  Stat: 'stat',
  Special: 'special',
} as const
export type EquipmentTraitCategory =
  (typeof EquipmentTraitCategory)[keyof typeof EquipmentTraitCategory]
