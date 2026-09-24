import { type Raw, markRaw, reactive } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { getSelectableStatTypes, getSelectableStats } from '@/lib/Character/Stat'

import { type SearchModeHandler, type StatOption, findStat } from '../setup'

function createStatOptions(): StatOption[] {
  const stats: StatOption[] = []
  getSelectableStats(Grimoire.Character.statList).forEach(stat => {
    getSelectableStatTypes(stat).forEach(type => {
      stats.push({ id: stat.getStatId(type), origin: stat, text: stat.title(type), type })
    })
  })
  return stats
}

export const useStatSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state: {
    stats: Raw<StatOption[]>
    statSearchText: string
    currentStats: StatOption[]
  } = reactive({
    stats: markRaw(createStatOptions()),
    statSearchText: '',
    currentStats: [],
  })

  function search(equipments: CharacterEquipment[]) {
    if (state.currentStats.length === 0) {
      return []
    }
    return equipments.filter(equipment =>
      state.currentStats.every(stat => findStat(stat, equipment.stats))
    )
  }

  function sort(item1: CharacterEquipment, item2: CharacterEquipment) {
    for (const stat of state.currentStats) {
      const value1 = findStat(stat, item1.stats)?.value ?? -99999
      const value2 = findStat(stat, item2.stats)?.value ?? -99999
      if (value1 !== value2) {
        return value1 - value2
      }
    }
    return 0
  }

  return { state, search, sort } satisfies SearchModeHandler<typeof state>
})
