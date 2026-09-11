import { reactive } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { type SearchModeHandler, compareId, findObtainByDye } from '../setup'

export const useDyeSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({ searchText: '' })

  function search(equipments: CharacterEquipment[]) {
    if (state.searchText === '') {
      return []
    }
    return equipments.filter(equipment => findObtainByDye(state.searchText, equipment).length > 0)
  }

  return { state, search, sort: compareId } satisfies SearchModeHandler<typeof state>
})
