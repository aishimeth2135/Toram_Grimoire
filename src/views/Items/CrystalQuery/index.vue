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
      <cy-pagination v-model:value="page" :max-page="maxPage" @changed="pageChanged" />
    </div>
    <AppLayoutBottom>
      <template #main-start>
        <cy-options
          :value="modes.find(item => item.id === mode)"
          :options="modes.map(item => ({ id: item.id, value: item }))"
          placement="top-start"
          @update:value="selectMode($event.id)"
        >
          <template #title>
            <cy-button-circle icon="heroicons-solid:switch-vertical" color="blue" />
          </template>
          <template #item="{ value }">
            <cy-icon-text :icon="value.icon">
              {{ t('crystal-query.modes.' + value.id) }}
            </cy-icon-text>
          </template>
        </cy-options>
      </template>
      <template #default>
        <div v-if="mode === 'normal'" class="flex w-full items-center">
          <cy-icon icon="ic-outline-search" class="shrink-0" />
          <input
            v-model="modeNormal.searchText"
            type="text"
            class="ml-2 inline-block w-full border-0 bg-transparent p-1"
            :placeholder="t('global.search')"
          />
          <cy-button-icon
            :class="{
              invisible: modeNormal.searchText === '',
            }"
            icon="mdi:close-circle"
            class="shrink-0"
            @click="modeNormal.searchText = ''"
          />
        </div>
        <cy-button-plain
          v-else-if="mode === 'stat'"
          icon="mdi-rhombus-outline"
          :color="modeStat.statItem ? 'primary' : 'red'"
          @click="toggleSelectedStatVisible"
        >
          {{ modeStat.statItem ? modeStat.statItem.text : t('crystal-query.select-stat.title') }}
        </cy-button-plain>
      </template>
      <template #side-buttons>
        <cy-button-circle
          v-if="mode === 'stat'"
          icon="ci:list-checklist-alt"
          color="cyan"
          @click="resultItemPreviewMode = resultItemPreviewMode === 'default' ? 'mode' : 'default'"
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
    <CrystalQuerySelectStat
      v-model:selected-stat-item="modeStat.statItem"
      :visible="selectedStatVisible"
      @close="toggleSelectedStatVisible"
    />
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { type Ref, computed, reactive, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import PageControl from '@/shared/setup/PageControl'
import { useToggle } from '@/shared/setup/State'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'
import { BagCrystal } from '@/lib/Items/BagItem'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CrystalQueryResultItem from './crystal-query-result-item.vue'
import CrystalQuerySelectStat from './crystal-query-select-stat.vue'

import { type StatOptionItem } from './setup'

defineOptions({
  name: 'CrystalQuery',
})

const { t } = useI18n()

const selectedStatVisible = ref(false)
const toggleSelectedStatVisible = useToggle(selectedStatVisible)

const searchFilterVisible = ref(false)
const toggleSearchFilterVisible = useToggle(searchFilterVisible)

const crystals: EquipmentCrystal[] = Grimoire.Items.crystals.map(
  crystal => new EquipmentCrystal(crystal)
)
const resultItemsDetailVisibleDefault = ref(false)
const topElement = useTemplateRef('top-element')

// ----- mode
const mode: Ref<'normal' | 'stat'> = ref('normal')
const modes: {
  id: 'normal' | 'stat'
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

const resultItemPreviewMode: Ref<'default' | 'mode'> = ref('default')

const modeNormal = reactive({
  searchText: '',
})

const modeStat = reactive({
  statItem: null as StatOptionItem | null,
})

const selectMode = (id: 'normal' | 'stat') => {
  mode.value = id
  resultItemPreviewMode.value = id === 'stat' ? 'mode' : 'default'
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
        const relatedCrystals = crystal.origin.getRelatedCrystals(categoryCrystals)
        return [...relatedCrystals.enhancers, ...relatedCrystals.prependeds].some(item =>
          item.name.toLowerCase().includes(text)
        )
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
const { currentItems, page, maxPage } = PageControl({
  items: resultCrystals,
  step: 30,
})

const pageChanged = () => {
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
