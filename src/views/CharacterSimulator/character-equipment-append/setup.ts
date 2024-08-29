import { type Ref, computed, markRaw, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { fuzzySearch, prepareFuzzySearch } from '@/shared/utils/data'

import {
  CharacterEquipment,
  EquipmentTypes,
} from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction } from '@/lib/Character/Stat'
import { StatTypes } from '@/lib/Character/Stat'
import { BagEquipment } from '@/lib/Items/BagItem'

export const enum EquipmentSearchMode {
  Normal,
  Stat,
}

export interface StatOption {
  id: string
  origin: StatBase
  text: string
  type: StatTypes
}

export function findStat(target: StatOption, stats: StatRestriction[]) {
  return stats.find(
    stat => stat.baseId === target.origin.baseId && stat.type === target.type
  )
}

export const useEquipmentsSearch = (
  filterEquipmentTypes: Ref<EquipmentTypes[]>
) => {
  const currentMode: Ref<EquipmentSearchMode> = ref(EquipmentSearchMode.Normal)
  const normalSearchText = ref('')
  const statSearchText = ref('')
  const selectedStatOption: Ref<StatOption | null> = ref(null)
  const sortByValue = ref(false)

  const statOptions = (() => {
    const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
    const _statOptions: StatOption[] = []
    Grimoire.Character.statList.forEach(stat => {
      if (stat.hidden) {
        return
      }
      statTypes.forEach(type => {
        if (type === StatTypes.Multiplier && !stat.hasMultiplier) {
          return
        }
        _statOptions.push(
          markRaw({
            id: stat.statId(type),
            origin: stat,
            text: stat.title(type),
            type,
          })
        )
      })
    })
    return _statOptions
  })()

  const statOptionsSearchResults = computed(() => {
    if (currentMode.value !== EquipmentSearchMode.Stat) {
      return []
    }
    if (!statSearchText.value) {
      return statOptions
    }

    const text = prepareFuzzySearch(statSearchText.value)

    const results = statOptions.filter(item => fuzzySearch(text, item.text))
    if (
      selectedStatOption.value &&
      !results.includes(selectedStatOption.value)
    ) {
      results.unshift(selectedStatOption.value)
    }
    return results
  })

  const allEqupments = Grimoire.Items.equipments.slice().reverse()

  const filteredEquipments = computed(() => {
    return allEqupments.filter(eq => {
      if (eq.category < 0) {
        return true
      }
      const type = CharacterEquipment.convertOriginalCategory(eq.category)
      return filterEquipmentTypes.value.includes(type)
    })
  })

  const normalModeSearchResults = computed(() => {
    if (!normalSearchText.value) {
      return filteredEquipments.value
    }
    const text = prepareFuzzySearch(normalSearchText.value)
    const results = filteredEquipments.value.filter(equip => {
      if (equip.category === -1) {
        return equip.name === normalSearchText.value
      }
      if (fuzzySearch(text, equip.name)) {
        return true
      }
      return equip.obtains.some(
        obtain => obtain.name && fuzzySearch(text, obtain.name)
      )
    })
    return results
  })

  const statModeSearchResultData = computed(() => {
    const previewStatMap = new Map<BagEquipment, StatRestriction>()
    if (!selectedStatOption.value) {
      return {
        results: [],
        previewStatMap,
      }
    }
    const results = filteredEquipments.value.filter(equip => {
      if (equip.category < 0) {
        return false
      }
      const previewStat = findStat(selectedStatOption.value!, equip.stats)
      if (previewStat) {
        previewStatMap.set(equip, previewStat)
      }
      return !!previewStat
    })
    return {
      results,
      previewStatMap,
    }
  })

  const searchResults = computed(() => {
    if (currentMode.value === EquipmentSearchMode.Stat) {
      let results = statModeSearchResultData.value.results
      const previewStatMap = statModeSearchResultData.value.previewStatMap
      if (sortByValue.value) {
        results = results
          .slice()
          .sort(
            (item1, item2) =>
              previewStatMap.get(item2)!.value -
              previewStatMap.get(item1)!.value
          )
      }
      return results
    }

    let results = normalModeSearchResults.value
    if (sortByValue.value) {
      results = results
        .slice()
        .sort((item1, item2) => item2.baseValue - item1.baseValue)
    }
    return results
  })

  const statModePreviewStatMap = computed(
    () => statModeSearchResultData.value.previewStatMap
  )

  return {
    currentMode,
    normalSearchText,
    statSearchText,
    selectedStatOption,
    statOptions,
    statOptionsSearchResults,
    searchResults,
    statModePreviewStatMap,
    sortByValue,
  }
}
