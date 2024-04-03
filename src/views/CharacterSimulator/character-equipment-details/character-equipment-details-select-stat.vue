<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { fuzzySearch, prepareFuzzySearch } from '@/shared/utils/data'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction, StatTypes } from '@/lib/Character/Stat'

import CommonSearchableItems from '../common/common-searchable-items.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const searchText = ref('')

interface StatOption {
  id: string
  origin: StatBase
  text: string
  type: StatTypes
}
const statOptions = (() => {
  const options: StatOption[] = []
  const optionsMap = new Map<string, StatOption>()
  const statTypes = [StatTypes.Constant, StatTypes.Multiplier]
  Grimoire.Character.statList
    .filter(stat => !stat.hidden)
    .forEach(stat => {
      statTypes
        .filter(type => !(type === StatTypes.Multiplier && !stat.hasMultiplier))
        .forEach(type => {
          const option = {
            id: stat.statId(type),
            origin: stat,
            text: stat.title(type),
            type,
          }
          options.push(option)
          optionsMap.set(stat.statId(type), option)
        })
    })
  return options
})()

const statsSearchResult = computed(() => {
  if (searchText.value === '') {
    return statOptions
  }
  const text = prepareFuzzySearch(searchText.value)
  return statOptions.filter(option => fuzzySearch(text, option.text))
})

const currentEquipmentStatOptions: ComputedRef<Map<string, StatRestriction>> =
  computed(() => {
    if (!props.equipment) {
      return new Map()
    }
    const stats = props.equipment.stats
    const statsMap = new Map<string, StatRestriction>()
    statOptions.forEach(option => {
      const equipmentStat = stats.find(stat =>
        option.origin.baseEqual(stat, option.type)
      )
      if (equipmentStat) {
        statsMap.set(option.id, equipmentStat)
      }
    })
    return statsMap
  })

const currentEquipmentStatOptionIds = computed(() =>
  Array.from(currentEquipmentStatOptions.value.keys())
)

const { t } = useI18n()

const toggleStat = (option: StatOption) => {
  if (currentEquipmentStatOptions.value.has(option.id)) {
    props.equipment.removeStat(
      currentEquipmentStatOptions.value.get(option.id)!
    )
  } else {
    const newStat = new StatRestriction(option.origin, option.type, 0)
    // eslint-disable-next-line vue/no-mutating-props
    props.equipment.stats.push(newStat)
  }
}
</script>

<template>
  <CommonSearchableItems
    v-model:search-text="searchText"
    :placeholder="
      t(
        'character-simulator.equipment-basic-editor.edit-stats.search-placeholder'
      )
    "
    :items="statsSearchResult"
    :selected-item-ids="currentEquipmentStatOptionIds"
    @select-item="toggleStat"
  >
    <template #item="{ item }">
      {{ item.text }}
    </template>
  </CommonSearchableItems>
</template>
