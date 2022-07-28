<template>
  <!-- <cy-icon-text
    v-if="type !== 'preview'"
    icon="mdi-leaf"
    is-item
    :text-color="negativeValue ? 'red' : 'dark'"
    :class="{ 'opacity-60': invalid }"
    class="mr-3"
  >
    <span
      v-for="text in restrictionTexts"
      :key="text"
      class="text-water-blue text-sm mr-1"
    >
      {{ text }}
    </span>
    <span>{{ stat.show() }}</span> -->
  <div
    v-if="type !== 'preview'"
    :class="{
      'opacity-60': invalid,
      'text-red': negativeValue,
      'text-dark': !negativeValue,
    }"
    class="mr-3 pl-4 flex items-end relative"
  >
    <div class="absolute left-0 bottom-1 w-2 h-2 bg-light rounded-full" />
    <div
      v-for="text in restrictionTexts"
      :key="text"
      class="text-water-blue text-sm mr-1"
    >
      {{ text }}
    </div>
    <div>{{ stat.show() }}</div>
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
