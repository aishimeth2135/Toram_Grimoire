<template>
  <div
    v-if="type !== 'preview'"
    :class="{
      'opacity-60': invalid,
      'text-red-60': negativeValue,
      'text-primary-90': !negativeValue,
    }"
    class="relative mr-3 inline-flex items-baseline pl-4"
  >
    <div class="bg-primary-20 absolute bottom-1 left-0 size-2 rounded-full" />
    <div v-for="text in restrictionTexts" :key="text" class="text-primary-40 mr-1 text-sm">
      {{ text }}
    </div>
    <div>{{ stat.show() }}</div>
  </div>
  <div v-else class="w-full text-sm">
    <span v-for="text in restrictionTexts" :key="text" class="text-primary-40 mr-1 text-sm">
      {{ text }}
    </span>
    <span :class="negativeValue ? 'text-red-60' : 'text-fuchsia-60'">
      {{ stat.show() }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { Stat, StatRestriction } from '@/lib/Character/Stat'

interface Props {
  stat: Stat | StatRestriction
  type?: 'normal' | 'preview'
  negativeValue?: boolean
  invalid?: boolean
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
