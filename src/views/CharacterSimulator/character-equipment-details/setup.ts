import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { defineState, defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

import {
  BodyArmorTypeList,
  type CharacterEquipment,
  type EquipmentTypes,
  MainWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'
import type { StatRestriction } from '@/lib/Character/Stat'

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

export interface EquipmentStatCombination {
  id: string
  stats: StatRestriction[]
  count: number
}

export function getEquipmentStatCombinations(
  equipments: CharacterEquipment[],
  positive: boolean
): EquipmentStatCombination[] {
  const combinations = new Map<string, EquipmentStatCombination>()
  equipments.forEach(equipment => {
    if (!equipment.isCustom) {
      return
    }
    const stats = equipment.stats.filter(stat => (positive ? stat.value >= 0 : stat.value < 0))
    if (stats.length === 0) {
      return
    }
    const id = JSON.stringify(stats.map(stat => stat.statId))
    const combination = combinations.get(id)
    if (combination) {
      combination.count += 1
    } else {
      combinations.set(id, { id, stats, count: 1 })
    }
  })

  const seen = new Set<string>()
  return Array.from(combinations.values())
    .sort((first, second) => second.count - first.count)
    .filter(combination => {
      const id = JSON.stringify(combination.stats.map(stat => stat.statId).sort())
      if (seen.has(id)) {
        return false
      }

      seen.add(id)
      return true
    })
}

export const useEquipmentStatCombinations = defineViewState(ViewNames.CharacterSimulator, () => {
  const characterStore = useCharacterStore()

  const setupCombinations = (types: EquipmentTypes[]) => {
    const equipments = computed<CharacterEquipment[]>(() =>
      characterStore.equipments.filter(equipment => types.includes(equipment.type))
    )
    const positive = computed<EquipmentStatCombination[]>(() =>
      getEquipmentStatCombinations(equipments.value, true)
    )
    const negative = computed<EquipmentStatCombination[]>(() =>
      getEquipmentStatCombinations(equipments.value, false)
    )
    return { positive, negative }
  }

  return {
    mainWeapon: setupCombinations(MainWeaponTypeList),
    bodyArmor: setupCombinations(BodyArmorTypeList),
  }
})

export const CharacterEquipmentEditModes = {
  Basic: 0,
  Stat: 1,
  Crystal: 2,
  Trait: 3,
} as const
export type CharacterEquipmentEditModes =
  (typeof CharacterEquipmentEditModes)[keyof typeof CharacterEquipmentEditModes]
