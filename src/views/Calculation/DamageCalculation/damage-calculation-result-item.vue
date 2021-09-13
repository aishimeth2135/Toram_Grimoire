<template>
  <div class="inline-flex items-center cursor-pointer">
    <cy-icon-text :icon="resultItem.icon">
      {{ lang('result/modes/' + resultItem.id) }}
    </cy-icon-text>
    <span
      v-if="(typeof resultItem.value === 'object')"
      class="text-light-3 inline-flex items-center ml-2"
    >
      <span>{{ resultItem.value.min }}</span>
      <cy-icon-text icon="mdi:tilde" class="mx-1" />
      <span>{{ resultItem.value.max }}</span>
    </span>
    <span v-else class="text-light-3 ml-2">{{ resultItem.value }}</span>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';

import RegisterLang from '@/setup/RegisterLang';

const props = defineProps({
  resultItem: {
    type: Object,
  },
});
const { resultItem } = toRefs(props);
const { lang } = RegisterLang('Damage Calculation');
</script>

