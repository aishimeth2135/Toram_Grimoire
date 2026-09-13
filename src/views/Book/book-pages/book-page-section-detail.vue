<template>
  <div class="flex items-center space-x-5 px-1 py-3">
    <div v-if="cellMap.has('latest_update')" class="flex items-center space-x-2">
      <div class="gap-icon text-primary-30 inline-flex items-center">
        <cy-icon icon="ic:round-access-time" class="text-primary-30" />
        {{ t('book-template.page-sections.detail.latest-update') }}
      </div>
      <div class="text-primary-60">
        {{ cellMap.get('latest_update') }}
      </div>
    </div>
    <div v-if="cellMap.has('author')" class="flex items-center space-x-2">
      <div class="gap-icon text-primary-30 inline-flex items-center">
        <cy-icon icon="ic:round-menu-book" class="text-primary-30" />
        {{ t('book-template.page-sections.detail.author') }}
      </div>
      <div class="text-primary-60">
        {{ cellMap.get('author') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { BookPageSection } from '../setup/Book'
import { getSectionCellMap } from './utils'

interface Props {
  section: BookPageSection
}

const props = defineProps<Props>()

const { t } = useI18n()

const cellMap = computed(() => {
  return getSectionCellMap(props.section)
})
</script>
