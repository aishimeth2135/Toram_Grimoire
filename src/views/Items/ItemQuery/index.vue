<template>
  <AppLayoutMain>
    <div v-if="searchResult.length > 0" class="py-4">
      <ItemQueryResult class="min-h-[70vh]" :equipments="searchResult" />
    </div>
    <cy-default-tips v-else icon="mdi-ghost" style="min-height: 30rem">
      {{ t('item-query.no-result-tips') }}
    </cy-default-tips>
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center">
          <template v-if="state.currentMode === 'normal'">
            <div class="ml-2 flex w-full items-center">
              <div class="relative flex w-full items-center">
                <cy-icon icon="ic-outline-search" class="shrink-0" />
                <input
                  v-model="normalMode.state.searchText"
                  type="text"
                  class="ml-2 inline-block w-full border-0 p-1"
                  :placeholder="t('global.search')"
                />
              </div>
              <cy-button-icon
                :class="{
                  invisible: normalMode.state.searchText === '',
                }"
                class="shrink-0"
                icon="mdi:close-circle"
                @click="normalMode.state.searchText = ''"
              />
              <cy-button-icon
                icon="heroicons-solid:menu"
                @click="normalMode.state.optionsVisible = !normalMode.state.optionsVisible"
              />
            </div>
          </template>
          <template v-else-if="state.currentMode === 'stat'">
            <cy-button-plain width-full @click="toggleSelectStatModalVisible">
              <template v-if="statMode.state.currentStats.length === 0">
                {{ t('item-query.options-stat.select-stat.title') }}
              </template>
              <template v-else-if="statMode.state.currentStats.length === 1">
                {{ statMode.state.currentStats[0].text }}
              </template>
              <template v-else>
                {{
                  t('item-query.options-stat.select-stat.title-multiple', {
                    num: statMode.state.currentStats.length,
                  })
                }}
              </template>
            </cy-button-plain>
          </template>
          <template v-else-if="state.currentMode === 'item-level'">
            <div class="flex items-center">
              <cy-icon icon="jam-hammer" class="ml-2" />
              <input
                v-model="itemLevelMinimum"
                type="text"
                placeholder="0"
                class="inline-block w-14 border-0 p-1 text-center"
              />
              <cy-icon icon="mdi-tilde" />
              <input
                v-model="itemLevelMaximum"
                type="text"
                placeholder="300"
                class="inline-block w-14 border-0 p-1 text-center"
              />
            </div>
          </template>
          <template v-else-if="state.currentMode === 'dye'">
            <div class="flex w-full items-center">
              <div class="relative flex w-full items-center">
                <cy-icon icon="ic-outline-palette" class="ml-2 shrink-0" />
                <input
                  v-model="dyeMode.state.searchText"
                  type="text"
                  class="ml-2 inline-block w-full border-0 p-1"
                  :placeholder="t('global.search')"
                />
                <cy-button-icon
                  :class="{
                    invisible: dyeMode.state.searchText === '',
                  }"
                  class="shrink-0"
                  icon="mdi:close-circle"
                  @click="dyeMode.state.searchText = ''"
                />
              </div>
            </div>
          </template>
        </div>
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
      <template #main-start>
        <cy-options
          :value="currentModeOption"
          :options="searchModeOptions.map(item => ({ id: item.id, value: item }))"
          placement="top-start"
          @update:value="selectMode($event.id)"
        >
          <template #title>
            <cy-button-circle icon="ic:baseline-settings" color="blue" />
          </template>
          <template #item="{ value }">
            <div class="gap-icon text-primary-90 inline-flex items-center">
              <cy-icon :icon="value.icon" class="text-primary-30" />
              {{ t('item-query.modes.' + value.id) }}
            </div>
          </template>
        </cy-options>
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
    <cy-modal v-model:visible="selectStatModalVisible" vertical-position="start" footer>
      <template #title>
        <div class="gap-icon text-primary-90 inline-flex items-center">
          <cy-icon icon="mdi-rhombus-outline" class="text-primary-30" />
          {{ t('item-query.options-stat.select-stat.title') }}
        </div>
      </template>
      <template #default>
        <div class="sticky top-0 bg-white">
          <cy-title-input
            v-model:value="statMode.state.statSearchText"
            icon="ic-outline-category"
            :placeholder="t('item-query.options-stat.select-stat.search-placeholder')"
            clearable
          />
        </div>
        <div v-if="statsSearchResult.length !== 0" class="divide-primary-20 divide-y">
          <div
            v-for="stat in statsSearchResult"
            :key="stat.origin.getStatId(stat.type)"
            class="hover:bg-primary-30/10 px-2 py-1 duration-200"
            @click="selectStat(stat)"
          >
            <cy-button-check :selected="statMode.state.currentStats.includes(stat)" class="w-full">
              {{ stat.text }}
            </cy-button-check>
          </div>
        </div>
        <cy-default-tips v-else icon="bx-bx-message-rounded-x">
          {{ t('item-query.no-result-tips') }}
        </cy-default-tips>
      </template>
      <template #footer-actions>
        <cy-button-action
          color="orange"
          icon="bx:reset"
          class="mr-auto"
          @click="statMode.state.currentStats = []"
        >
          {{ t('global.reset') }}
        </cy-button-action>
      </template>
    </cy-modal>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { ViewNames } from '@/shared/consts/view'
import { registViewStatesCleaning, useToggle, useToggleGroup } from '@/shared/setup/State'
import { toInt } from '@/shared/utils/number'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import ItemQueryFilterMenu from './item-query-filter-menu.vue'
import ItemQueryResult from './item-query-result.vue'

import { useDyeSearchMode } from './modes/dye'
import { useItemLevelSearchMode } from './modes/item-level'
import { useNormalSearchMode } from './modes/normal'
import { useStatSearchMode } from './modes/stat'
import {
  type SearchMode,
  type SearchModeHandler,
  type SortOption,
  type StatOption,
  searchModeOptions,
  useItemQueryState,
} from './setup'

defineOptions({ name: 'ItemQuery' })

type SortHandler = (item1: CharacterEquipment, item2: CharacterEquipment) => number
const equipments = Grimoire.Items.equipments.map(equipment =>
  CharacterEquipment.fromOriginEquipment(equipment)
)
const { state, sortState, conditionOptionsVisible, sortOptionsVisible, selectStatModalVisible } =
  useItemQueryState()
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
const toggleSelectStatModalVisible = useToggle(selectStatModalVisible)

const sortOrderOptions = ['down', 'up'].map(id => ({
  value: id,
  text: t('item-query.sort-options.order.' + id),
}))

const sortOptions = ['default', 'atk', 'def', 'stability', 'name', 'id'].map(id => ({
  value: id,
  text: t('item-query.sort-options.options.' + id),
}))

const currentModeOption = computed(() =>
  searchModeOptions.find(option => option.id === state.currentMode)
)
const currentMode = computed<SearchModeHandler<unknown>>(() => modes[state.currentMode])

const itemLevelMaximum = computed<number>({
  get: () => itemLevelMode.state.max,
  set: value => {
    itemLevelMode.state.max = Math.max(Math.min(500, value), 0)
  },
})
const itemLevelMinimum = computed<number>({
  get: () => itemLevelMode.state.min,
  set: value => {
    itemLevelMode.state.min = Math.max(Math.min(500, value), 0)
  },
})
const statsSearchResult = computed(() => {
  const searchText = statMode.state.statSearchText.toLowerCase()
  return statMode.state.stats.filter(stat => stat.text.toLowerCase().includes(searchText))
})

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

function selectStat(stat: StatOption) {
  const searchStats = statMode.state.currentStats
  const index = searchStats.indexOf(stat)
  if (index > -1) {
    searchStats.splice(index, 1)
  } else {
    searchStats.push(stat)
  }
}

function selectMode(id: SearchMode) {
  state.currentMode = id
  state.displayMode = 'default'
}

registViewStatesCleaning(ViewNames.ItemQuery)
</script>
