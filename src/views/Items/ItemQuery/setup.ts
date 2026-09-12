import { reactive, ref } from 'vue'

import { defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'
import { toInt } from '@/shared/utils/number'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction, StatTypes } from '@/lib/Character/Stat'
import type { BagItemObtain } from '@/lib/Items/BagItem'

export type SearchMode = 'normal' | 'stat' | 'item-level' | 'dye'
export type DisplayMode = 'default' | 'current-mode'
export type SortOption = 'default' | 'atk' | 'def' | 'stability' | 'name' | 'id'
export type SortOrder = 'down' | 'up'
export type NormalSearchTarget = 'name' | 'material' | 'obtain-name' | 'map'

export interface StatOption {
  id: string
  origin: StatBase
  text: string
  type: StatTypes
}

export interface CommonOption<V = unknown> {
  value: V
  selected: boolean
}

export interface SearchModeHandler<State> {
  state: State
  search: (equipments: CharacterEquipment[]) => CharacterEquipment[]
  sort: (item1: CharacterEquipment, item2: CharacterEquipment) => number
}

export interface SearchModeOption {
  id: SearchMode
  icon: string
}

export function findStat(target: StatOption, stats: StatRestriction[]) {
  return stats.find(stat => stat.baseId === target.origin.baseId && stat.type === target.type)
}

export function dyeConvert(value: string): (number | null)[] {
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
    return obtains.filter(obtain => dyeConvert(obtain['dye']!).some(item => item === resultValue))
  }

  const searchData = dyeConvert(text)
  if (searchData.every(item => item === null)) {
    return []
  }
  return obtains.filter(obtain => {
    const data = dyeConvert(obtain['dye']!)
    return data.some((item, idx) => {
      const searchValue = searchData[idx]
      if (searchValue === null) {
        return false
      }
      return searchValue === 0 ? item !== null : item === searchValue
    })
  })
}

export function handleOptions<V>(options: V[]): CommonOption<V>[] {
  return options.map(value => ({ value, selected: true }))
}

export function compareId(item1: CharacterEquipment, item2: CharacterEquipment) {
  const id1 = toInt(item1.origin!.id) ?? -1
  const id2 = toInt(item2.origin!.id) ?? -1
  return id1 - id2
}

export const searchModeOptions: SearchModeOption[] = [
  { id: 'normal', icon: 'ic-round-menu-book' },
  { id: 'stat', icon: 'mdi-script-outline' },
  { id: 'item-level', icon: 'jam-hammer' },
  { id: 'dye', icon: 'ic-outline-palette' },
]

export const useItemQueryState = defineViewState(ViewNames.ItemQuery, () => {
  const state = reactive({
    currentMode: 'normal' as SearchMode,
    displayMode: 'default' as DisplayMode,
  })
  const sortState = reactive({
    currentSelected: 'default' as SortOption,
    currentOrder: 'down' as SortOrder,
  })
  const conditionOptionsVisible = ref(false)
  const sortOptionsVisible = ref(false)

  return {
    state,
    sortState,
    conditionOptionsVisible,
    sortOptionsVisible,
  }
})
