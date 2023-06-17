<template>
  <AppLayoutMain class="py-6">
    <RegistletQueryResult :registlet-items="currentItems" />
    <AppLayoutBottom>
      <template #default>
        <div class="flex w-full items-center">
          <cy-icon-text icon="ic-outline-search" />
          <input
            v-model="searchText"
            type="text"
            class="ml-2 inline-block w-full border-0 bg-transparent p-1"
            :placeholder="t('global.search')"
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
          @click="toggle('menus/displayMode')"
        />
      </template>
      <template #side-contents>
        <cy-transition>
          <AppLayoutBottomContent v-if="menus.displayMode" class="p-3">
            <div>
              <cy-icon-text small text-color="primary-30">
                {{ t('registlet-query.display-mode.title') }}
              </cy-icon-text>
            </div>
            <div class="mt-1.5 pl-2.5">
              <cy-button-check
                :selected="state.displayMode === 'category'"
                @click="state.displayMode = 'category'"
              >
                {{ t('registlet-query.display-mode.category') }}
              </cy-button-check>
            </div>
            <div class="pl-2.5">
              <cy-button-check
                :selected="state.displayMode === 'obtain-levels'"
                @click="state.displayMode = 'obtain-levels'"
              >
                {{ t('registlet-query.display-mode.obtain-levels') }}
              </cy-button-check>
            </div>
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'RegistletQuery',
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import ToggleService from '@/shared/setup/ToggleService'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import RegistletQueryResult from './registlet-query-result.vue'

import { useRegistletQueryState } from './setup'

const Registlet = Grimoire.Registlet!

const registletItems: RegistletItemBase[] = [
  ...Registlet.statCategory.items,
  ...Registlet.specialCategory.items,
  ...Registlet.skillCategory.items,
]

const { t } = useI18n()
const { toggle, menus } = ToggleService({ menus: ['displayMode'] as const })

const searchText = ref('')

const state = useRegistletQueryState()

const currentModeItems = computed(() => {
  if (state.displayMode === 'obtain-levels') {
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
  if (!searchText.value) {
    return currentModeItems.value
  }
  const text = searchText.value.toLowerCase()
  return currentModeItems.value.filter(item => {
    if (item.name.toLowerCase().includes(text)) {
      return true
    }
    return item.rows.some(row => row.value.toLowerCase().includes(text))
  })
})
</script>
