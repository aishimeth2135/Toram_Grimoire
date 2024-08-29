<template>
  <div v-if="!device.isMobile" class="relative z-1 flex py-1">
    <div
      class="mt-6 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white bg-opacity-75"
    >
      <cy-icon :icon="icon" :class="iconClass" width="1.25rem" />
    </div>
    <div class="flex flex-wrap pl-2 pr-6">
      <slot />
    </div>
  </div>
  <div v-else class="relative z-1 flex py-2">
    <div
      class="mt-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white bg-opacity-75"
    >
      <cy-icon :icon="icon" :class="iconClass" width="1.125rem" />
    </div>
    <div class="flex flex-wrap pl-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useDevice } from '@/shared/setup/Device'

interface Props {
  icon: string
  color: string
}

const props = defineProps<Props>()

const { device } = useDevice()

const iconClass = computed(() => `text-${props.color}-30`)
</script>
