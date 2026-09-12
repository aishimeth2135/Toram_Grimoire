import { reactive } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { type SearchModeHandler, compareId, findObtainByDye } from '../setup'

export type DyePart = 'A' | 'B' | 'C'

export const useDyeSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({
    searchText: 'A0B0C0',
    color: 0,
    parts: ['A', 'B', 'C'] as DyePart[],
  })

  function updateSearchText() {
    state.searchText = state.parts.map(part => `${part}${state.color}`).join('')
  }

  function selectColor(color: number) {
    state.color = color
    updateSearchText()
  }

  function togglePart(part: DyePart) {
    const index = state.parts.indexOf(part)
    if (index === -1) {
      state.parts.push(part)
    } else {
      state.parts.splice(index, 1)
    }
    updateSearchText()
  }

  function search(equipments: CharacterEquipment[]) {
    if (state.searchText === '') {
      return []
    }
    return equipments.filter(equipment => findObtainByDye(state.searchText, equipment).length > 0)
  }

  return {
    state,
    search,
    sort: compareId,
    selectColor,
    togglePart,
  } satisfies SearchModeHandler<typeof state> & {
    selectColor: (color: number) => void
    togglePart: (part: DyePart) => void
  }
})
