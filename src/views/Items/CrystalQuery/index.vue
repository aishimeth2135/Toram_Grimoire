<template>
  <section>
    <div ref="topElement" />
    <div class="overflow-x-auto" style="min-height: 75vh">
      <template v-if="currentItems.length !== 0">
        <div class="min-w-min divide-y divide-light">
          <CrystalQueryResultItem
            v-for="crystal in currentItems"
            :key="crystal.id"
            :crystal="crystal"
            :detail-visible-default="resultItemsDetailVisibleDefault"
            :preview-stat="mode === 'stat' ? modeStat.statItem : null"
            :preview-mode="resultItemPreviewMode"
          />
        </div>
        <cy-pagination
          v-model:value="page"
          :max-page="maxPage"
          @changed="pageChanged"
        />
      </template>
      <cy-default-tips v-else>
        {{ t('crystal-query.no-results-tips') }}
      </cy-default-tips>
    </div>
    <div class="sticky bottom-2 mx-2 mt-2 pointer-events-none z-5 flex flex-wrap">
      <div class="flex items-end ml-auto mb-2 space-x-2 pointer-events-auto">
        <div v-if="contents.searchFilter" class="border-1 border-light-3 rounded-md p-4 bg-white">
          <div class="flex items-center">
            <cy-icon-text small text-color="purple">
              {{ t('crystal-query.crystal-category.title') }}
            </cy-icon-text>
            <div class="inline-flex items-center ml-4 space-x-2">
              <cy-button-circle small icon="ic-round-border-all" @click="toggleSearchFilterAll(searchFilter.category, true)" />
              <cy-button-circle small icon="eva-close-outline" @click="toggleSearchFilterAll(searchFilter.category, false)" />
            </div>
          </div>
          <div>
            <cy-button-check
              v-for="option in searchFilter.category.options"
              :key="option"
              :selected="searchFilter.category.selectedOptions.includes(option)"
              @click="toggleSearchFilter(searchFilter.category, option)"
            >
              {{ t('crystal-query.crystal-category.categorys.' + option) }}
            </cy-button-check>
          </div>
        </div>
        <div class="flex-shrink-0 flex flex-col items-center space-y-2">
          <cy-button-circle
            v-if="mode === 'stat'"
            icon="ci:list-checklist-alt"
            main-color="blue-green"
            @click="resultItemPreviewMode = resultItemPreviewMode === 'default' ? 'mode' : 'default'"
          />
          <cy-button-circle
            icon="mdi:arrow-expand"
            main-color="water-blue"
            @click="resultItemsDetailVisibleDefault = !resultItemsDetailVisibleDefault"
          />
          <cy-button-circle
            icon="mdi:filter"
            main-color="orange"
            @click="toggle('contents/searchFilter')"
          />
        </div>
      </div>
      <div class="flex items-center space-x-2 w-full pointer-events-auto">
        <cy-options inline>
          <template #title>
            <cy-button-circle
              icon="heroicons-solid:switch-vertical"
              main-color="water-blue"
            />
          </template>
          <template #options>
            <div class="my-1 px-2">
              <cy-icon-text small text-color="light-2">
                {{ t('crystal-query.modes.title') }}
              </cy-icon-text>
            </div>
            <div>
              <cy-list-item
                v-for="modeItem in modes"
                :key="modeItem.id"
                :selected="mode === modeItem.id"
                @click="selectMode(modeItem.id)"
              >
                <cy-icon-text :icon="modeItem.icon">
                  {{ t('crystal-query.modes.' + modeItem.id) }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </template>
        </cy-options>
        <div class="border-1 border-light-2 px-4 py-0.5 rounded-full bg-white w-full">
          <div v-if="mode === 'normal'" class="flex items-center w-full">
            <cy-icon-text icon="ic-outline-search" />
            <input
              v-model="modeNormal.searchText"
              type="text"
              class="border-0 p-1 ml-2 inline-block w-full bg-transparent"
              :placeholder="t('global.search')"
            />
          </div>
          <cy-button-inline
            v-else-if="mode === 'stat'"
            icon="mdi-rhombus-outline"
            :main-color="modeStat.statItem ? 'default' : 'red'"
            @click="toggle('modals/selectStat')"
          >
            {{ modeStat.statItem ? modeStat.statItem.text : t('crystal-query.select-stat.title') }}
          </cy-button-inline>
        </div>
      </div>
    </div>
    <CrystalQuerySelectStat
      v-model:selected-stat-item="modeStat.statItem"
      :visible="modals.selectStat"
      @close="toggle('modals/selectStat')"
    />
  </section>
</template>

<script lang="ts">
export default {
  name: 'CrystalQuery',
}
</script>

<script lang="ts" setup>
import { computed, reactive, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'

import PageControl from '@/setup/PageControl'
import ToggleService from '@/setup/ToggleService'

import CrystalQueryResultItem from './crystal-query-result-item.vue'
import CrystalQuerySelectStat from './crystal-query-select-stat.vue'

import { StatOptionItem } from './setup'

const { t } = useI18n()
const { modals, contents, toggle } = ToggleService({
  modals: ['selectStat'] as const,
  contents: ['searchFilter'] as const,
})

const crystals = Grimoire.Items.crystals.map(crystal => new EquipmentCrystal(crystal))
const resultItemsDetailVisibleDefault = ref(false)
const topElement: Ref<HTMLElement | null> = ref(null)

// ----- mode
const mode: Ref<'normal' | 'stat'> = ref('normal')
const modes: {
  id: 'normal' | 'stat';
  icon: string;
}[] = [{
  id: 'normal',
  icon: 'ic:baseline-search',
}, {
  id: 'stat',
  icon: 'mdi:script-outline',
}]

const resultItemPreviewMode: Ref<'default' | 'mode'> = ref('default')

const modeNormal = reactive({
  searchText: '',
})

const modeStat = reactive({
  statItem: null,
}) as {
  statItem: StatOptionItem | null;
}

const selectMode = (id: 'normal' | 'stat') => {
  mode.value = id
  resultItemPreviewMode.value = id === 'stat' ? 'mode' : 'default'
}

// ----- search filter
interface SearchFilterItem {
  options: unknown[];
  selectedOptions: unknown[];
}

const searchFilter = reactive({
  category: {
    options: [0, 1, 2, 3, 4],
    selectedOptions: [0, 1, 2, 3, 4],
  },
}) as Record<'category', SearchFilterItem>

const toggleSearchFilter = (target: SearchFilterItem, item: unknown) => {
  const idx = target.selectedOptions.indexOf(item)
  if (idx > -1) {
    target.selectedOptions.splice(idx, 1)
  } else {
    target.selectedOptions.push(item)
  }
}

const toggleSearchFilterAll = (target: SearchFilterItem, force: boolean) => {
  target.selectedOptions = force ? target.options.slice() : []
}

// search result
const resultCrystals = computed(() => {
  const filteredCrystals = crystals.filter(crystal => searchFilter.category.selectedOptions.includes(crystal.origin.category))
  if (mode.value === 'normal') {
    const text = modeNormal.searchText.toLowerCase()
    return filteredCrystals.filter(crystal => crystal.name.toLowerCase().includes(text))
  }
  if (mode.value === 'stat') {
    if (!modeStat.statItem) {
      return []
    }
    const statItem = modeStat.statItem
    const result = filteredCrystals
      .filter(crystal => crystal.stats.find(stat => stat.base === statItem.origin && stat.type === statItem.type))
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

// ----- page control
const { currentItems, page, maxPage } = PageControl({
  items: resultCrystals,
  step: 30,
})

const pageChanged = () => {
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
