<template>
  <AppLayoutMain class="py-6">
    <TraitQueryResult :trait-items="currentItems" :default-visible="itemDefaultVisible" />
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
            :class="{ invisible: searchText === '' }"
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
          @click="itemDefaultVisible = !itemDefaultVisible"
        />
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'
import { fuzzySearch, prepareFuzzySearch } from '@/shared/utils/data/dataCommon'

import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import TraitQueryResult from './trait-query-result.vue'

defineOptions({ name: 'TraitQuery' })

const { t } = useI18n()
const searchText = ref('')
const itemDefaultVisible = ref(false)
const traitItems = Grimoire.EquipmentTrait.equipmentTraitItems

const currentItems = computed(() => {
  const text = prepareFuzzySearch(searchText.value)
  if (!text) {
    return traitItems
  }
  return traitItems.filter(item =>
    [
      item.name,
      item.caption.description,
      ...item.caption.tips,
      ...item.stats.map(stat => stat.getShowData().title),
    ].some(value => fuzzySearch(text, value))
  )
})
</script>
