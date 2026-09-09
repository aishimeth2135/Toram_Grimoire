const equipmentLabelColorClasses = {
  red: { text: 'text-red-60', background: 'bg-red-50' },
  blue: { text: 'text-blue-60', background: 'bg-blue-50' },
  cyan: { text: 'text-cyan-60', background: 'bg-cyan-50' },
  emerald: { text: 'text-emerald-60', background: 'bg-emerald-50' },
  fuchsia: { text: 'text-fuchsia-60', background: 'bg-fuchsia-50' },
  gray: { text: 'text-gray-60', background: 'bg-gray-50' },
  orange: { text: 'text-orange-60', background: 'bg-orange-50' },
  violet: { text: 'text-violet-60', background: 'bg-violet-50' },
} as const

export type EquipmentLabelColor = keyof typeof equipmentLabelColorClasses

export const equipmentLabelColors = Object.keys(equipmentLabelColorClasses) as EquipmentLabelColor[]

export function getEquipmentLabelColorClasses(color: string) {
  return equipmentLabelColorClasses[color as EquipmentLabelColor] ?? equipmentLabelColorClasses.red
}
