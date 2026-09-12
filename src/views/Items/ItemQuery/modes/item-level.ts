import { reactive } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'
import { toFloat } from '@/shared/utils/number'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import type { SearchModeHandler } from '../setup'

export const useItemLevelSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({ min: 0, max: 500 })

  function search(equipments: CharacterEquipment[]) {
    const min = state.min || 0
    const max = state.max || 999
    return equipments.filter(equipment => {
      const itemLevel = equipment.origin!.recipe?.['item_level']
      if (!itemLevel) {
        return false
      }
      return itemLevel >= min && itemLevel <= max
    })
  }

  function sort(item1: CharacterEquipment, item2: CharacterEquipment) {
    const value1 = toFloat(item1.origin!.recipe?.['item_level']?.toString() ?? '') ?? -99999
    const value2 = toFloat(item2.origin!.recipe?.['item_level']?.toString() ?? '') ?? -99999
    return value1 - value2
  }

  return { state, search, sort } satisfies SearchModeHandler<typeof state>
})
