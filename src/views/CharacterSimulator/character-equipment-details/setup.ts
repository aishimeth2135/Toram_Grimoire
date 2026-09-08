import { defineState } from '@/shared/setup/State'

const useLocalState = defineState(() => {
  const increasement = { value: -1 }
  return {
    increasement,
  }
})

export function getPropInputAutoId() {
  const { increasement } = useLocalState()
  increasement.value += 1
  return `__CY_PROP_INPUT_${increasement.value}__`
}

export const CharacterEquipmentEditModes = {
  Basic: 0,
  Stat: 1,
  Crystal: 2,
  Trait: 3,
} as const
export type CharacterEquipmentEditModes =
  (typeof CharacterEquipmentEditModes)[keyof typeof CharacterEquipmentEditModes]
