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

export const enum CharacterEquipmentEditModes {
  Basic,
  Stat,
  Crystal,
}
