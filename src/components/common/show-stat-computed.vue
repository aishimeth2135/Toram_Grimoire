<script lang="ts" setup>
import { computed } from 'vue'

import type { StatComputed } from '@/lib/Character/Stat'

interface Props {
  stat: StatComputed
  handleValue?: (value: string) => string
}

const props = defineProps<Props>()

const statShowData = computed(() => props.stat.getShowData())

const displayedValue = computed(() => {
  if (props.handleValue) {
    return props.handleValue(statShowData.value.originalValue)
  }
  return statShowData.value.originalValue
})
</script>

<template>
  <span v-if="!stat.isBoolStat">
    {{ statShowData.title + '+' }}
    <span class="cy--text-separate text-primary-50">
      {{ displayedValue }}
    </span>
    <span v-if="statShowData.tail" class="text-primary-50">
      {{ statShowData.tail }}
    </span>
  </span>
  <span v-else class="text-primary-50">
    {{ statShowData.title }}
  </span>
</template>
