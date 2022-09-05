<template>
  <div class="py-3 px-1 flex items-center space-x-5">
    <div v-if="cellMap.has('latest_update')" class="flex items-center space-x-2">
      <cy-icon-text icon="ic:round-access-time" color="primary-30" single-color>
        {{ t('book-template.page-sections.detail.latest-update') }}
      </cy-icon-text>
      <div class="text-primary-60">
        {{ cellMap.get('latest_update') }}
      </div>
    </div>
    <div v-if="cellMap.has('author')" class="flex items-center space-x-2">
      <cy-icon-text icon="ic:round-menu-book" color="primary-30" single-color>
        {{ t('book-template.page-sections.detail.author') }}
      </cy-icon-text>
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
  section: BookPageSection;
}

const props = defineProps<Props>()

const { t } = useI18n()

const cellMap = computed(() => {
  return getSectionCellMap(props.section)
})
</script>
