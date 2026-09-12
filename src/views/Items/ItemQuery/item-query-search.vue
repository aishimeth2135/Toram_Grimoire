<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import CommonSearchableItemsPopover from '@/views/CharacterSimulator/common/common-searchable-items-popover.vue'

import { useDyeSearchMode } from './modes/dye'
import { useItemLevelSearchMode } from './modes/item-level'
import { useNormalSearchMode } from './modes/normal'
import { useStatSearchMode } from './modes/stat'
import { type SearchMode, type StatOption, searchModeOptions, useItemQueryState } from './setup'

defineOptions({ name: 'ItemQuerySearch' })

const { t } = useI18n()
const { state } = useItemQueryState()
const normalMode = useNormalSearchMode()
const statMode = useStatSearchMode()
const itemLevelMode = useItemLevelSearchMode()
const dyeMode = useDyeSearchMode()

const currentModeOption = computed(() =>
  searchModeOptions.find(option => option.id === state.currentMode)
)
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
const selectedStatIds = computed(() => statMode.state.currentStats.map(stat => stat.id))

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
</script>

<template>
  <div class="pointer-events-auto flex grow items-center rounded-full shadow-lg">
    <cy-options
      class="flex self-stretch"
      :value="currentModeOption"
      :options="searchModeOptions.map(item => ({ id: item.id, value: item }))"
      placement="top-start"
      @update:value="selectMode($event.id)"
    >
      <template #title>
        <div
          class="border-primary-30 hover:bg-primary-10 flex cursor-pointer items-center self-stretch rounded-l-full border border-r-0 bg-white pl-3.5 pr-2.5 duration-150"
        >
          <cy-icon icon="mdi:exchange" />
        </div>
      </template>
      <template #item="{ value }">
        <div class="gap-icon text-primary-90 inline-flex items-center">
          <cy-icon :icon="value.icon" class="text-primary-30" />
          {{ t('item-query.modes.' + value.id) }}
        </div>
      </template>
    </cy-options>
    <div
      class="border-primary-30 focus-within:border-primary-60 min-w-0 grow rounded-r-full border bg-white"
    >
      <template v-if="state.currentMode === 'normal'">
        <div class="flex w-full items-center pl-2.5 pr-2">
          <div class="relative flex w-full items-center">
            <cy-icon icon="ic-outline-search" class="shrink-0" />
            <input
              v-model="normalMode.state.searchText"
              type="text"
              class="grow border-0 px-2 py-2"
              :placeholder="t('global.search')"
            />
          </div>
          <cy-button-icon
            :class="{ invisible: normalMode.state.searchText === '' }"
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
        <div class="min-w-68 border-primary-20 inline-flex p-0.5 sm:border-r">
          <CommonSearchableItemsPopover
            v-model:search-text="statMode.state.statSearchText"
            :placeholder="t('item-query.options-stat.select-stat.search-placeholder')"
            :items="statsSearchResult"
            :selected-item-ids="selectedStatIds"
            placement="top"
            @select-item="selectStat"
          >
            <div v-if="statMode.state.currentStats.length === 0" class="text-primary-30 text-sm">
              {{ t('item-query.options-stat.select-stat.title') }}
            </div>
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
            <template #item="{ item }">
              {{ item.text }}
            </template>
          </CommonSearchableItemsPopover>
        </div>
      </template>
      <template v-else-if="state.currentMode === 'item-level'">
        <div class="flex items-center py-2 pl-3 pr-2">
          <cy-icon icon="jam-hammer" />
          <input
            v-model="itemLevelMinimum"
            type="text"
            placeholder="0"
            class="inline-block w-14 border-0 bg-transparent p-0 text-center"
          />
          <cy-icon icon="mdi-tilde" />
          <input
            v-model="itemLevelMaximum"
            type="text"
            placeholder="500"
            class="inline-block w-14 border-0 bg-transparent p-0 text-center"
          />
        </div>
      </template>
      <div v-else-if="state.currentMode === 'dye'" class="flex w-full items-center pl-2.5 pr-2">
        <div class="relative flex w-full items-center">
          <cy-icon icon="ic-outline-search" class="shrink-0" />
          <input
            v-model="dyeMode.state.searchText"
            type="text"
            class="grow border-0 px-2 py-2"
            :placeholder="t('global.search')"
          />
        </div>
        <cy-button-icon
          :class="{ invisible: dyeMode.state.searchText === '' }"
          class="shrink-0"
          icon="mdi:close-circle"
          @click="dyeMode.state.searchText = ''"
        />
      </div>
    </div>
  </div>
</template>
