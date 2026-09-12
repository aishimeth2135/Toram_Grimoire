import { reactive } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

import type { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatTypes } from '@/lib/Character/Stat'

import { type SearchModeHandler, type StatOption, findStat } from '../setup'

function createStatOptions(): StatOption[] {
  const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
  const stats: StatOption[] = []
  Grimoire.Character.statList.forEach(stat => {
    if (stat.hidden) {
      return
    }
    statTypes.forEach(type => {
      if (type === StatTypes.Multiplier && !stat.hasMultiplier) {
        return
      }
      stats.push({ id: stat.getStatId(type), origin: stat, text: stat.title(type), type })
    })
  })
  return stats
}

export const useStatSearchMode = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({
    stats: createStatOptions(),
    statSearchText: '',
    currentStats: [] as StatOption[],
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
