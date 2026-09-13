<template>
  <div class="inline-flex cursor-pointer items-center">
    <div class="gap-icon text-primary-90 inline-flex items-center">
      <cy-icon :icon="resultItem.icon" class="text-primary-30" />
      {{ t('damage-calculation.result.modes.' + resultItem.id) }}
    </div>
    <span
      v-if="typeof resultItem.value === 'object'"
      class="text-primary-50 ml-2 inline-flex items-center"
    >
      <span>{{ resultItem.value.min }}</span>
      <cy-icon icon="mdi:tilde" class="mx-1" />
      <span>{{ resultItem.value.max }}</span>
    </span>
    <span v-else class="text-primary-50 ml-2">{{ resultItem.value }}</span>
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
