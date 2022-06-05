<template>
  <div
    v-if="type !== 'preview'"
    class="stat-scope inline-block mr-3"
    :class="{ 'opacity-60': invalid }"
  >
    <cy-icon-text
      icon="mdi-leaf"
      type="item"
      :text-color="negativeValue ? 'red' : 'dark'"
    >
      <span
        v-for="text in restrictionTexts"
        :key="text"
        class="text-water-blue text-sm mr-1"
      >
        {{ text }}
      </span>
      <span>{{ stat.show() }}</span>
    </cy-icon-text>
  </div>
  <div v-else class="w-full text-sm">
    <span
      v-for="text in restrictionTexts"
      :key="text"
      class="text-water-blue text-sm mr-1"
    >
      {{ text }}
    </span>
    <span :class="negativeValue ? 'text-red' : 'text-purple'">{{ stat.show() }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { Stat, StatRestriction } from '@/lib/Character/Stat'

interface Props {
  stat: Stat | StatRestriction;
  type?: 'normal' | 'preview';
  negativeValue?: boolean;
  invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'normal',
  negativeValue: false,
  invalid: false,
})

const restrictionTexts = computed(() => {
  if (props.stat instanceof StatRestriction) {
    return props.stat.restrictionTexts()
  }
  return []
})
</script>
