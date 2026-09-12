<template>
  <AppLayoutMain class="py-6">
    <RegistletQueryResult :registlet-items="currentItems" />
    <AppLayoutBottom>
      <template #default>
        <div class="flex w-full items-center">
          <cy-icon icon="ic-outline-search" class="shrink-0" />
          <input
            v-model="searchText"
            type="text"
            class="ml-2 inline-block w-full border-0 bg-transparent p-1"
            :placeholder="t('global.search')"
          />
          <cy-button-icon
            :class="{
              invisible: searchText === '',
            }"
            class="shrink-0"
            icon="mdi:close-circle"
            @click="searchText = ''"
          />
        </div>
      </template>
      <template #side-buttons>
        <cy-button-circle
          icon="mdi:arrow-expand"
          color="blue"
          @click="state.itemDefaultVisible = !state.itemDefaultVisible"
        />
        <cy-button-circle
          icon="ic:round-filter-list"
          color="orange"
          @click="toggleDisplayModeMenuVisible"
        />
      </template>
      <template #side-contents>
        <AppLayoutBottomContent v-if="displayModeMenuVisible" class="px-4 py-2.5">
          <div class="text-gray-40 text-sm">
            {{ t('registlet-query.display-mode.title') }}
          </div>
          <div class="mt-1 flex">
            <cy-button-radio
              :selected="state.displayMode === 'category'"
              @click="state.displayMode = 'category'"
            >
              {{ t('registlet-query.display-mode.category') }}
            </cy-button-radio>
            <cy-button-radio
              :selected="state.displayMode === 'obtain-level'"
              @click="state.displayMode = 'obtain-level'"
            >
              {{ t('registlet-query.display-mode.obtain-levels') }}
            </cy-button-radio>
          </div>
          <div class="text-gray-40 mt-4 text-sm">
            {{ t('registlet-query.detail.obtain-levels') }}
          </div>
          <cy-button-radio-group
            v-model:value="searchObtainLevel"
            :options="searchObtainLevelOptions"
            class="mt-1"
          />
        </AppLayoutBottomContent>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { registViewStatesCleaning, useToggle } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view.ts'
import { fuzzySearch, prepareFuzzySearch } from '@/shared/utils/data/dataCommon.ts'

import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import RegistletQueryResult from './registlet-query-result.vue'

import { useRegistletQueryState } from './setup'

defineOptions({
  name: 'RegistletQuery',
})

const registletItems: RegistletItemBase[] = [
  ...Grimoire.Registlet.statCategory.items,
  ...Grimoire.Registlet.specialCategory.items,
  ...Grimoire.Registlet.skillCategory.items,
]

const { t } = useI18n()
const allObtainLevelList = Grimoire.Registlet.getAllObtainLevelList()
const SEARCH_OBTAIN_LEVEL_NONE = 0
const searchObtainLevelOptions = [SEARCH_OBTAIN_LEVEL_NONE, ...allObtainLevelList].map(level => ({
  text:
    level === SEARCH_OBTAIN_LEVEL_NONE
      ? t('registlet-query.detail.obtain-levels-all')
      : level.toString(),
  value: level,
}))

const displayModeMenuVisible = ref(false)
const toggleDisplayModeMenuVisible = useToggle(displayModeMenuVisible)

const searchText = ref('')
const searchObtainLevel = ref(SEARCH_OBTAIN_LEVEL_NONE)

const { registletQueryState: state } = useRegistletQueryState()

const currentModeItems = computed(() => {
  if (state.displayMode === 'obtain-level') {
    return registletItems.slice().sort((item1, item2) => {
      const lv1 = item1.obtainLevels[0]
      const lv2 = item2.obtainLevels[0]
      if (item1.obtainLevels.length === 0) {
        return item2.obtainLevels.length > 0 ? 1 : 0
      }
      if (item2.obtainLevels.length === 0) {
        return 1
      }
      if (lv1 === lv2) {
        if (item1.obtainLevels.length === item2.obtainLevels.length) {
          let cur = 1
          while (
            cur < item1.obtainLevels.length &&
            item1.obtainLevels[cur] !== item2.obtainLevels[cur]
          ) {
            cur += 1
          }
          return item1.obtainLevels[cur] - item2.obtainLevels[cur]
        }
        return item2.obtainLevels.length - item1.obtainLevels.length
      }
      return lv1 - lv2
    })
  }
  return registletItems
})

const currentItems = computed(() => {
  if (!searchText.value && searchObtainLevel.value === SEARCH_OBTAIN_LEVEL_NONE) {
    return currentModeItems.value
  }
  const text = prepareFuzzySearch(searchText.value)
  return currentModeItems.value.filter(item => {
    if (
      searchObtainLevel.value !== SEARCH_OBTAIN_LEVEL_NONE &&
      !item.obtainLevels.includes(searchObtainLevel.value)
    ) {
      return false
    }
    if (fuzzySearch(text, item.name)) {
      return true
    }
    return item.rows.some(row => fuzzySearch(text, row.value))
  })
})

registViewStatesCleaning(ViewNames.RegistletQuery)
</script>
