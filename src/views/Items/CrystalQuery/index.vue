<template>
  <AppLayoutMain>
    <div ref="top-element" />
    <div class="px-1 py-4">
      <CardRowsWrapper class="mb-4">
        <div class="overflow-x-auto" style="min-height: 75vh">
          <template v-if="currentItems.length !== 0">
            <CardRows class="min-w-min">
              <CrystalQueryResultItem
                v-for="crystal in currentItems"
                :key="crystal.id"
                :crystal="crystal"
                :detail-visible-default="resultItemsDetailVisibleDefault"
                :preview-stat="mode === 'stat' ? modeStat.statItem : null"
                :preview-mode="resultItemPreviewMode"
              />
            </CardRows>
          </template>
          <cy-default-tips v-else>
            {{ t('crystal-query.no-results-tips') }}
          </cy-default-tips>
        </div>
      </CardRowsWrapper>
      <cy-pagination
        v-if="!paginationUseless"
        v-model:value="page"
        :max-page="maxPage"
        @changed="pageChanged"
      />
    </div>
    <AppLayoutBottom>
      <template #main-custom>
        <div class="pointer-events-auto flex grow items-center rounded-full shadow-lg">
          <cy-options
            class="flex self-stretch"
            :value="modes.find(item => item.id === mode)"
            :options="modes.map(item => ({ id: item.id, value: item }))"
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
                {{ t('crystal-query.modes.' + value.id) }}
              </div>
            </template>
          </cy-options>
          <div
            class="border-primary-30 focus-within:border-primary-60 min-w-0 grow rounded-r-full border bg-white"
          >
            <div v-if="mode === 'normal'" class="flex w-full items-center pl-2.5 pr-2">
              <div class="relative flex w-full items-center">
                <cy-icon icon="ic-outline-search" class="shrink-0" />
                <input
                  v-model="modeNormal.searchText"
                  type="text"
                  class="grow border-0 p-2"
                  :placeholder="t('global.search')"
                />
              </div>
              <cy-button-icon
                :class="{ invisible: modeNormal.searchText === '' }"
                class="shrink-0"
                icon="mdi:close-circle"
                @click="modeNormal.searchText = ''"
              />
            </div>
            <div v-else-if="mode === 'stat'" class="min-w-68 border-primary-20 inline-flex p-0.5">
              <CommonSearchableItemsPopover
                v-model:search-text="modeStat.searchText"
                :placeholder="t('crystal-query.select-stat.search-placeholder')"
                :items="statSearchResult"
                :selected-item-ids="modeStat.statItem ? [modeStat.statItem.id] : []"
                placement="top"
                close-on-select
                @select-item="selectStat"
              >
                <div v-if="!modeStat.statItem" class="text-primary-30 text-sm">
                  {{ t('crystal-query.select-stat.title') }}
                </div>
                <template v-else>
                  {{ modeStat.statItem.text }}
                </template>
                <template #item="{ item }">
                  {{ item.text }}
                </template>
              </CommonSearchableItemsPopover>
            </div>
          </div>
        </div>
      </template>
      <template #side-buttons>
        <cy-button-circle
          v-if="mode === 'stat'"
          icon="ci:list-checklist-alt"
          color="cyan"
          @click="
            resultItemPreviewMode = resultItemPreviewMode === 'default' ? 'current-mode' : 'default'
          "
        />
        <cy-button-circle
          icon="mdi:arrow-expand"
          color="blue"
          @click="resultItemsDetailVisibleDefault = !resultItemsDetailVisibleDefault"
        />
        <cy-button-circle
          icon="mdi:filter"
          color="orange"
          :selected="searchFilterVisible"
          float
          toggle
          @click="toggleSearchFilterVisible"
        />
      </template>
      <template #side-contents>
        <AppLayoutBottomContent v-if="searchFilterVisible" class="p-3">
          <div>
            <cy-button-check v-model:selected="allSearchFilterSelected" color="orange">
              {{ t('crystal-query.crystal-category.title') }}
            </cy-button-check>
          </div>
          <div>
            <cy-button-check
              v-for="option in categoryOptions"
              :key="option.category"
              v-model:selected="option.selected"
            >
              {{ t('crystal-query.crystal-category.categorys.' + option.category) }}
            </cy-button-check>
          </div>
        </AppLayoutBottomContent>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { type Ref, computed, reactive, ref, shallowReactive, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { usePageControl } from '@/shared/composables/PageControl'
import { useToggle } from '@/shared/composables/State'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'
import { getSelectableStatTypes, getSelectableStats } from '@/lib/Character/Stat'
import { BagCrystal } from '@/lib/Items/BagItem'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'
import CommonSearchableItemsPopover from '@/views/CharacterSimulator/common/common-searchable-items-popover.vue'

import CrystalQueryResultItem from './crystal-query-result-item.vue'

import { type PreviewMode, type StatOptionItem } from './setup'

defineOptions({
  name: 'CrystalQuery',
})

type SearchMode = 'normal' | 'stat'

const { t } = useI18n()

const searchFilterVisible = ref(false)
const toggleSearchFilterVisible = useToggle(searchFilterVisible)

const crystals: EquipmentCrystal[] = Grimoire.Items.crystals.map(crystal =>
  EquipmentCrystal.create(crystal)
)
const resultItemsDetailVisibleDefault = ref(false)
const topElement = useTemplateRef('top-element')

// Mode
const mode: Ref<SearchMode> = ref('normal')
const modes: {
  id: SearchMode
  icon: string
}[] = [
  {
    id: 'normal',
    icon: 'ic:baseline-search',
  },
  {
    id: 'stat',
    icon: 'mdi:script-outline',
  },
]

const resultItemPreviewMode: Ref<PreviewMode> = ref('default')

const modeNormal = shallowReactive({
  searchText: '',
})

const modeStat = shallowReactive({
  searchText: '',
  statItem: null as StatOptionItem | null,
})

const statOptions: StatOptionItem[] = []
getSelectableStats(Grimoire.Character.statList).forEach(stat => {
  getSelectableStatTypes(stat).forEach(type => {
    statOptions.push({
      id: stat.getStatId(type),
      origin: stat,
      type,
      text: stat.title(type),
    })
  })
})

const statSearchResult = computed(() => {
  const searchText = modeStat.searchText.toLowerCase()
  return statOptions.filter(option => option.text.toLowerCase().includes(searchText))
})

const selectStat = (option: StatOptionItem) => {
  modeStat.statItem = option
}

const selectMode = (id: SearchMode) => {
  mode.value = id
  resultItemPreviewMode.value = id === 'stat' ? 'current-mode' : 'default'
}

// Search filter
const allCategories = [0, 1, 2, 3, 4]

const categoryOptions = reactive(
  allCategories.map(item => ({
    category: item,
    selected: true,
  }))
)

const allSearchFilterSelected = computed({
  get() {
    return categoryOptions.every(item => item.selected)
  },
  set(value) {
    categoryOptions.forEach(item => {
      item.selected = value
    })
  },
})

const categoryCrystalsMap = new Map<number, BagCrystal[]>(allCategories.map(item => [item, []]))
crystals.forEach(_crystal => {
  const list = categoryCrystalsMap.get(_crystal.origin.category)
  if (list) {
    list.push(_crystal.origin)
  }
})

// Search result
const resultCrystals = computed(() => {
  const selectedCategories = categoryOptions
    .filter(option => option.selected)
    .map(option => option.category)

  const filteredCrystals = crystals.filter(crystal =>
    selectedCategories.includes(crystal.origin.category)
  )
  if (mode.value === 'normal') {
    const text = modeNormal.searchText.toLowerCase()
    return filteredCrystals.filter(crystal => {
      if (crystal.name.toLowerCase().includes(text)) {
        return true
      }
      const categoryCrystals = categoryCrystalsMap.get(crystal.origin.category)
      if (categoryCrystals) {
        return crystal.origin
          .getRelatedCrystalsLists(categoryCrystals)
          .some(item => item.name.toLowerCase().includes(text))
      }
      return false
    })
  }
  if (mode.value === 'stat') {
    if (!modeStat.statItem) {
      return []
    }
    const statItem = modeStat.statItem
    const result = filteredCrystals.filter(crystal =>
      crystal.stats.find(stat => stat.base === statItem.origin && stat.type === statItem.type)
    )
    result.sort((item1, item2) => {
      const value1 = item1.stats
        .filter(stat => stat.base === statItem.origin && stat.type === statItem.type)
        .reduce((cur, stat) => cur + stat.value, 0)
      const value2 = item2.stats
        .filter(stat => stat.base === statItem.origin && stat.type === statItem.type)
        .reduce((cur, stat) => cur + stat.value, 0)
      return value2 - value1
    })
    return result
  }
  return []
})

// Page control
const { currentItems, page, maxPage, paginationUseless } = usePageControl({
  items: resultCrystals,
  step: 30,
})

const pageChanged = () => {
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
