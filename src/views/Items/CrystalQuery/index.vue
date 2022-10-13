<template>
  <AppLayoutMain>
    <div ref="topElement" />
    <div class="overflow-x-auto py-4" style="min-height: 75vh">
      <template v-if="currentItems.length !== 0">
        <div class="min-w-min divide-y divide-primary-20">
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
    <AppLayoutBottom>
      <template #main-start>
        <cy-options
          :value="modes.find(item => item.id === mode)"
          :options="modes.map(item => ({ id: item.id, value: item }))"
          placement="top-start"
          @update:value="selectMode($event.id)"
        >
          <template #title>
            <cy-button-circle
              icon="heroicons-solid:switch-vertical"
              color="blue"
            />
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
          <cy-icon-text icon="ic-outline-search" />
          <input
            v-model="modeNormal.searchText"
            type="text"
            class="ml-2 inline-block w-full border-0 bg-transparent p-1"
            :placeholder="t('global.search')"
          />
        </div>
        <cy-button-plain
          v-else-if="mode === 'stat'"
          icon="mdi-rhombus-outline"
          :color="modeStat.statItem ? 'primary' : 'fuchsia'"
          @click="toggle('modals/selectStat')"
        >
          {{
            modeStat.statItem
              ? modeStat.statItem.text
              : t('crystal-query.select-stat.title')
          }}
        </cy-button-plain>
      </template>
      <template #side-buttons>
        <cy-button-circle
          v-if="mode === 'stat'"
          icon="ci:list-checklist-alt"
          color="cyan"
          @click="
            resultItemPreviewMode =
              resultItemPreviewMode === 'default' ? 'mode' : 'default'
          "
        />
        <cy-button-circle
          icon="mdi:arrow-expand"
          color="blue"
          @click="
            resultItemsDetailVisibleDefault = !resultItemsDetailVisibleDefault
          "
        />
        <cy-button-circle
          icon="mdi:filter"
          color="orange"
          :selected="contents.searchFilter"
          float
          toggle
          @click="toggle('contents/searchFilter')"
        />
      </template>
      <template #side-contents>
        <AppLayoutBottomContent v-if="contents.searchFilter" class="p-3">
          <div class="flex items-center">
            <cy-icon-text small text-color="fuchsia-60">
              {{ t('crystal-query.crystal-category.title') }}
            </cy-icon-text>
            <div class="ml-4 inline-flex items-center space-x-2">
              <cy-button-circle
                small
                icon="ic-round-border-all"
                @click="toggleSearchFilterAll(searchFilter.category, true)"
              />
              <cy-button-circle
                small
                icon="eva-close-outline"
                @click="toggleSearchFilterAll(searchFilter.category, false)"
              />
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
        </AppLayoutBottomContent>
      </template>
    </AppLayoutBottom>
    <CrystalQuerySelectStat
      v-model:selected-stat-item="modeStat.statItem"
      :visible="modals.selectStat"
      @close="toggle('modals/selectStat')"
    />
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'CrystalQuery',
}
</script>

<script lang="ts" setup>
import { Ref, computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'
import { Crystal } from '@/lib/Items/Item'

import PageControl from '@/setup/PageControl'
import ToggleService from '@/setup/ToggleService'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import CrystalQueryResultItem from './crystal-query-result-item.vue'
import CrystalQuerySelectStat from './crystal-query-select-stat.vue'

import { StatOptionItem } from './setup'

const { t } = useI18n()
const { modals, contents, toggle } = ToggleService({
  modals: ['selectStat'] as const,
  contents: ['searchFilter'] as const,
})

const crystals = Grimoire.Items.crystals.map(
  crystal => new EquipmentCrystal(crystal)
)
const resultItemsDetailVisibleDefault = ref(false)
const topElement: Ref<HTMLElement | null> = ref(null)

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
  statItem: null,
}) as {
  statItem: StatOptionItem | null
}

const selectMode = (id: 'normal' | 'stat') => {
  mode.value = id
  resultItemPreviewMode.value = id === 'stat' ? 'mode' : 'default'
}

// ----- search filter
interface SearchFilterItem {
  options: any[]
  selectedOptions: any[]
}

const searchFilter = {
  category: reactive({
    options: [0, 1, 2, 3, 4],
    selectedOptions: [0, 1, 2, 3, 4],
  }),
} as Record<'category', SearchFilterItem>

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

const categoryCrystalsMap = new Map<number, Crystal[]>(
  searchFilter.category.options.map(item => [item, []])
)
crystals.forEach(_crystal => {
  const list = categoryCrystalsMap.get(_crystal.origin.category)
  if (list) {
    list.push(_crystal.origin)
  }
})

// search result
const resultCrystals = computed(() => {
  const filteredCrystals = crystals.filter(crystal =>
    searchFilter.category.selectedOptions.includes(crystal.origin.category)
  )
  if (mode.value === 'normal') {
    const text = modeNormal.searchText.toLowerCase()
    return filteredCrystals.filter(crystal => {
      if (crystal.name.toLowerCase().includes(text)) {
        return true
      }
      const categoryCrystals = categoryCrystalsMap.get(crystal.origin.category)
      if (categoryCrystals) {
        const relatedCrystals =
          crystal.origin.getRelatedCrystals(categoryCrystals)
        return [
          ...relatedCrystals.enhancers,
          ...relatedCrystals.prependeds,
        ].some(item => item.name.toLowerCase().includes(text))
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
      crystal.stats.find(
        stat => stat.base === statItem.origin && stat.type === statItem.type
      )
    )
    result.sort((item1, item2) => {
      const value1 = item1.stats
        .filter(
          stat => stat.base === statItem.origin && stat.type === statItem.type
        )
        .reduce((cur, stat) => cur + stat.value, 0)
      const value2 = item2.stats
        .filter(
          stat => stat.base === statItem.origin && stat.type === statItem.type
        )
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
