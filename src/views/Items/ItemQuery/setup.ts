import { reactive } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'
import type { BagItemObtain } from '@/lib/Items/BagItem'

export interface StatOption {
  origin: StatBase
  text: string
  type: StatTypes
}
export interface CommonOption {
  value: string
  selected: boolean
}

export function findStat(target: StatOption, stats: StatRestriction[]) {
  return stats.find(stat => stat.baseId === target.origin.baseId && stat.type === target.type)
}

function dyeConvert(value: string): (number | null)[] {
  value = value.toLowerCase()
  const categoryMapping = ['a', 'b', 'c']
  const result: (number | null)[] = [null, null, null]
  ;[...value.matchAll(/(a|b|c)(\d+)/g)].forEach(item => {
    const category = item[1]
    const num = toInt(item[2])
    if (num !== null) {
      result[categoryMapping.indexOf(category)] = num
    }
  })
  return result
}

export function findObtainByDye(text: string, eq: CharacterEquipment): BagItemObtain[] {
  if (text === '') {
    return []
  }
  const obtains = eq.origin!.obtains.filter(obtain => obtain['dye'])

  const resultValue = toInt(text)
  if (resultValue !== null) {
    return obtains.filter(obtain => {
      const dye = obtain['dye']!
      const data = dyeConvert(dye)
      return data.some(item => item === resultValue)
    })
  }

  const searchData = dyeConvert(text)
  if (searchData.every(item => item === null)) {
    return []
  }
  return obtains.filter(obtain => {
    const dye = obtain['dye']!
    const data = dyeConvert(dye)
    return data.every((item, idx) => searchData[idx] === null || item === searchData[idx])
  })
}

export function handleOptions(opts: string[]): CommonOption[] {
  return opts.map(value => ({
    value,
    selected: true,
  }))
}

export const enum SearchModes {
  Normal = 'normal',
  Stat = 'stat',
  ItemLevel = 'item-level',
  Dye = 'dye',
}

const state: {
  currentMode: SearchModes
  displayMode: 0 | 1
} = reactive({
  currentMode: SearchModes.Normal,
  displayMode: 0,
})

const modes = reactive({
  [SearchModes.Normal]: {
    id: SearchModes.Normal,
    icon: 'ic-round-menu-book',
    targets: handleOptions(['name', 'material', 'obtain-name', 'map']),
    optionsVisible: false,
    searchText: '',
  },
  [SearchModes.Stat]: {
    id: SearchModes.Stat,
    icon: 'mdi-script-outline',
    stats: [] as StatOption[],
    statSearchText: '',
    currentStats: [] as StatOption[],
  },
  [SearchModes.ItemLevel]: {
    id: SearchModes.ItemLevel,
    icon: 'jam-hammer',
    min: 0,
    max: 300,
  },
  [SearchModes.Dye]: {
    id: SearchModes.Dye,
    icon: 'ic-outline-palette',
    searchText: '',
  },
}) as {
  [SearchModes.Normal]: {
    id: SearchModes
    icon: string
    targets: CommonOption[]
    optionsVisible: boolean
    searchText: string
  }
  [SearchModes.Stat]: {
    id: SearchModes
    icon: string
    stats: StatOption[]
    statSearchText: string
    currentStats: StatOption[]
  }
  [SearchModes.ItemLevel]: {
    id: SearchModes.ItemLevel
    icon: string
    min: number
    max: number
  }
  [SearchModes.Dye]: {
    id: SearchModes
    icon: string
    searchText: string
  }
}

export function useItemQueryModes() {
  if (modes[SearchModes.Stat].stats.length === 0) {
    const stats = (() => {
      const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
      const _stats: StatOption[] = []
      Grimoire.Character.statList.forEach(stat => {
        if (stat.hidden) {
          return
        }
        statTypes.forEach(type => {
          if (type === StatTypes.Multiplier && !stat.hasMultiplier) {
            return
          }
          _stats.push({
            origin: stat,
            text: stat.title(type),
            type,
          })
        })
      })
      return _stats
    })()
    modes[SearchModes.Stat].stats = stats
  }
  return {
    state,
    modes,
  }
}
