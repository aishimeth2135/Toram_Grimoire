<script lang="ts" setup>
import { type ComputedRef, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { fuzzySearch, prepareFuzzySearch } from '@/shared/utils/data'

import {
  BodyArmorTypeList,
  CharacterEquipment,
  MainWeaponTypeList,
} from '@/lib/Character/CharacterEquipment'
import { StatBase, StatRestriction, StatTypes } from '@/lib/Character/Stat'

import CommonSearchableItems from '../common/common-searchable-items.vue'
import CharacterEquipmentDetailsQuickReplaceStat from './character-equipment-details-quick-replace-stat.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const searchText = ref('')
const currentTab = ref<'select' | 'replace'>('select')
const supportsReplacement = computed(
  () =>
    MainWeaponTypeList.includes(props.equipment.type) ||
    BodyArmorTypeList.includes(props.equipment.type)
)

watch(
  () => props.equipment,
  () => {
    currentTab.value = 'select'
  }
)

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
            id: stat.getStatId(type),
            origin: stat,
            text: stat.title(type),
            type,
          }
          options.push(option)
          optionsMap.set(stat.getStatId(type), option)
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

const currentEquipmentStatOptions: ComputedRef<Map<string, StatRestriction>> = computed(() => {
  if (!props.equipment) {
    return new Map()
  }
  const stats = props.equipment.stats
  const statsMap = new Map<string, StatRestriction>()
  statOptions.forEach(option => {
    const equipmentStat = stats.find(stat => option.origin.baseEquals(stat, option.type))
    if (equipmentStat) {
      statsMap.set(option.id, equipmentStat)
    }
  })
  return statsMap
})

const currentEquipmentStatOptionIds = computed(() =>
  Array.from(currentEquipmentStatOptions.value.keys())
)

const toggleStat = (option: StatOption) => {
  if (currentEquipmentStatOptions.value.has(option.id)) {
    props.equipment.removeStat(currentEquipmentStatOptions.value.get(option.id)!)
  } else {
    const newStat = StatRestriction.create(option.origin, option.type, 0)
    // eslint-disable-next-line vue/no-mutating-props
    props.equipment.stats.push(newStat)
  }
}
</script>

<template>
  <div class="wd-lg:max-h-none flex h-full max-h-[80dvh] min-h-0 flex-col">
    <cy-tabs v-if="supportsReplacement" v-model="currentTab" class="mb-3 shrink-0">
      <cy-tab value="select">
        {{ t('character-simulator.select-stats.select-tab') }}
      </cy-tab>
      <cy-tab value="replace">
        {{ t('character-simulator.select-stats.quick-replace-tab') }}
      </cy-tab>
    </cy-tabs>
    <div class="flex min-h-0 grow flex-col" :class="{ 'pt-3': !supportsReplacement }">
      <CommonSearchableItems
        v-if="currentTab === 'select' || !supportsReplacement"
        v-model:search-text="searchText"
        class="max-h-none! max-w-none! min-h-0 w-full grow"
        :placeholder="t('global.search')"
        :items="statsSearchResult"
        :selected-item-ids="currentEquipmentStatOptionIds"
        @select-item="toggleStat"
      >
        <template #item="{ item }">
          {{ item.text }}
        </template>
      </CommonSearchableItems>
      <CharacterEquipmentDetailsQuickReplaceStat v-else :equipment="equipment" class="grow" />
    </div>
  </div>
</template>
