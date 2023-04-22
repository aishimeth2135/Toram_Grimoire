<template>
  <div class="inline-flex cursor-pointer items-center">
    <cy-icon-text :icon="resultItem.icon">
      {{ t('damage-calculation.result.modes.' + resultItem.id) }}
    </cy-icon-text>
    <span
      v-if="typeof resultItem.value === 'object'"
      class="ml-2 inline-flex items-center text-primary-50"
    >
      <span>{{ resultItem.value.min }}</span>
      <cy-icon-text icon="mdi:tilde" class="mx-1" />
      <span>{{ resultItem.value.max }}</span>
    </span>
    <span v-else class="ml-2 text-primary-50">{{ resultItem.value }}</span>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ResultModeItem } from './setup'

interface Props {
  resultItem: ResultModeItem
}

const props = defineProps<Props>()
const { resultItem } = toRefs(props)
const { t } = useI18n()
</script>
