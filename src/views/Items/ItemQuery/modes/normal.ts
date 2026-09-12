import { reactive } from 'vue'

import { defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { type NormalSearchTarget, type SearchModeHandler, compareId, handleOptions } from '../setup'

export const useNormalSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({
    targets: handleOptions<NormalSearchTarget>(['name', 'material', 'obtain-name', 'map']),
    optionsVisible: false,
    searchText: '',
  })

  function search(equipments: CharacterEquipment[]) {
    const searchText = state.searchText.toLowerCase()
    if (searchText === '') {
      return equipments
    }
    const targets = state.targets.filter(option => option.selected).map(option => option.value)
    return equipments.filter(equipment => {
      const origin = equipment.origin!
      return targets.some(target => {
        if (target === 'name') {
          return origin.name.toLowerCase().includes(searchText)
        }
        if (target === 'material') {
          return origin.recipe?.['materials']?.some(material =>
            material.name.toLowerCase().includes(searchText)
          )
        }
        if (target === 'obtain-name') {
          return origin.obtains.some(obtain => obtain['name']?.toLowerCase().includes(searchText))
        }
        return origin.obtains.some(obtain => obtain['map']?.toLowerCase().includes(searchText))
      })
    })
  }

  return { state, search, sort: compareId } satisfies SearchModeHandler<typeof state>
})
