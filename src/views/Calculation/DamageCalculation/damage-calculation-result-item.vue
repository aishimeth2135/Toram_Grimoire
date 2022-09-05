<template>
  <div class="inline-flex items-center cursor-pointer">
    <cy-icon-text :icon="resultItem.icon">
      {{ t('damage-calculation.result.modes.' + resultItem.id) }}
    </cy-icon-text>
    <span
      v-if="(typeof resultItem.value === 'object')"
      class="text-primary-50 inline-flex items-center ml-2"
    >
      <span>{{ resultItem.value.min }}</span>
      <cy-icon-text icon="mdi:tilde" class="mx-1" />
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
  resultItem: ResultModeItem;
}

const props = defineProps<Props>()
const { resultItem } = toRefs(props)
const { t } = useI18n()
</script>

