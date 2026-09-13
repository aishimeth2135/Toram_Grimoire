<template>
  <AppLayoutMain>
    <div v-if="searchResult.length > 0" class="py-4">
      <ItemQueryResult class="min-h-[70vh]" :equipments="searchResult" />
    </div>
    <cy-default-tips v-else icon="mdi-ghost" style="min-height: 30rem">
      {{ t('item-query.no-result-tips') }}
    </cy-default-tips>
    <AppLayoutBottom>
      <template #main-custom>
        <ItemQuerySearch />
      </template>
      <template #main-content>
        <AppLayoutBottomContent
          v-if="state.currentMode === 'normal' && normalMode.state.optionsVisible"
          class="px-3.5 py-2.5"
        >
          <div class="text-primary-30 mb-1 text-sm">
            {{ t('item-query.options-normal.title') }}
          </div>
          <div>
            <cy-button-check
              v-for="item in normalMode.state.targets"
              :key="item.value"
              v-model:selected="item.selected"
            >
              {{ t('item-query.options-normal.' + item.value) }}
            </cy-button-check>
          </div>
        </AppLayoutBottomContent>
      </template>
      <template #side-buttons>
        <cy-button-circle
          v-if="state.currentMode === 'stat' || state.currentMode === 'item-level'"
          icon="heroicons-solid:switch-vertical"
          color="orange"
          @click="state.displayMode = state.displayMode === 'default' ? 'current-mode' : 'default'"
        />
        <cy-button-circle
          icon="mdi-sort-variant"
          color="blue"
          :selected="sortOptionsVisible"
          float
          toggle
          @click="toggleOptionContents(false).and(toggleSortOptionsVisible)"
        />
        <cy-button-circle
          icon="mdi:filter"
          color="bright"
          :selected="conditionOptionsVisible"
          float
          toggle
          @click="toggleOptionContents(false).and(toggleConditionOptionsVisible)"
        />
      </template>
      <template #side-contents>
        <AppLayoutBottomContent v-show="conditionOptionsVisible">
          <ItemQueryFilterMenu :equipments="equipments" @filter="validEquipments = $event" />
        </AppLayoutBottomContent>
        <AppLayoutBottomContent v-show="sortOptionsVisible" class="px-3.5 py-2.5">
          <div class="text-primary-30 text-sm">
            {{ t('item-query.sort-options.title') }}
          </div>
          <cy-button-radio-group v-model:value="sortState.currentSelected" :options="sortOptions" />
          <div class="text-primary-30 mt-2 text-sm">
            {{ t('item-query.sort-options.order.title') }}
          </div>
          <cy-button-radio-group
            v-model:value="sortState.currentOrder"
            :options="sortOrderOptions"
          />
        </AppLayoutBottomContent>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { registViewStatesCleaning, useToggle, useToggleGroup } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'
import { toInt } from '@/shared/utils/number'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import ItemQueryFilterMenu from './item-query-filter-menu.vue'
import ItemQueryResult from './item-query-result.vue'
import ItemQuerySearch from './item-query-search.vue'

import { useDyeSearchMode } from './modes/dye'
import { useItemLevelSearchMode } from './modes/item-level'
import { useNormalSearchMode } from './modes/normal'
import { useStatSearchMode } from './modes/stat'
import {
  type SearchMode,
  type SearchModeHandler,
  type SortOption,
  useItemQueryState,
} from './setup'

defineOptions({ name: 'ItemQuery' })

type SortHandler = (item1: CharacterEquipment, item2: CharacterEquipment) => number
const equipments = Grimoire.Items.equipments.map(equipment =>
  CharacterEquipment.fromOriginEquipment(equipment)
)
const { state, sortState, conditionOptionsVisible, sortOptionsVisible } = useItemQueryState()
const normalMode = useNormalSearchMode()
const statMode = useStatSearchMode()
const itemLevelMode = useItemLevelSearchMode()
const dyeMode = useDyeSearchMode()
const modes = {
  'normal': normalMode,
  'stat': statMode,
  'item-level': itemLevelMode,
  'dye': dyeMode,
} satisfies Record<SearchMode, SearchModeHandler<unknown>>
const { t } = useI18n()

const toggleConditionOptionsVisible = useToggle(conditionOptionsVisible)
const toggleSortOptionsVisible = useToggle(sortOptionsVisible)
const toggleOptionContents = useToggleGroup([
  toggleConditionOptionsVisible,
  toggleSortOptionsVisible,
])
const sortOrderOptions = ['down', 'up'].map(id => ({
  value: id,
  text: t('item-query.sort-options.order.' + id),
}))

const sortOptions = ['default', 'atk', 'def', 'stability', 'name', 'id'].map(id => ({
  value: id,
  text: t('item-query.sort-options.options.' + id),
}))

const currentMode = computed<SearchModeHandler<unknown>>(() => modes[state.currentMode])

const validEquipments = shallowRef<CharacterEquipment[]>(equipments.slice())
const searchResult = computed(() => {
  const result = currentMode.value.search(validEquipments.value).slice()
  result.sort(getSortHandler(sortState.currentSelected))
  return sortState.currentOrder === 'down' ? result.reverse() : result
})

function compareId(item1: CharacterEquipment, item2: CharacterEquipment) {
  return (toInt(item1.origin!.id) ?? -1) - (toInt(item2.origin!.id) ?? -1)
}

function getSortHandler(option: SortOption): SortHandler {
  if (option === 'default') {
    return currentMode.value.sort
  }
  if (option === 'atk' || option === 'def') {
    const kind = option === 'atk' ? EquipmentKinds.Weapon : EquipmentKinds.Armor
    return (item1, item2) => {
      const value1 = item1.basicValue + (item1.is(kind) ? 9999 : 0)
      const value2 = item2.basicValue + (item2.is(kind) ? 9999 : 0)
      return value1 - value2
    }
  }
  if (option === 'stability') {
    return (item1, item2) => {
      const value1 = item1.is(EquipmentKinds.Weapon) ? item1.stability : -1
      const value2 = item2.is(EquipmentKinds.Weapon) ? item2.stability : -1
      return value1 === -1 && value2 === -1 ? currentMode.value.sort(item1, item2) : value1 - value2
    }
  }
  return option === 'name' ? (item1, item2) => item1.name.localeCompare(item2.name) : compareId
}

registViewStatesCleaning(ViewNames.ItemQuery)
</script>
