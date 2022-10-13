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

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

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

const searchText = ref('')

const currentItems = computed(() => {
  if (!searchText.value) {
    return registletItems
  }
  const text = searchText.value.toLowerCase()
  return registletItems.filter(item => {
    if (item.name.toLowerCase().includes(text)) {
      return true
    }
    return item.rows.some(row => row.value.toLocaleLowerCase().includes(text))
  })
})

const state = useRegistletQueryState()
</script>
