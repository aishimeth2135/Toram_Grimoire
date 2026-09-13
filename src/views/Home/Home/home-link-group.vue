<template>
  <div v-if="!device.isMobile" class="relative z-1 flex py-1">
    <div class="mt-6 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/75">
      <cy-icon :icon="icon" :class="iconClass" width="1.25rem" />
    </div>
    <div class="flex flex-wrap pr-6 pl-2">
      <slot />
    </div>
  </div>
  <div v-else class="relative z-1 flex py-2">
    <div class="mt-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/75">
      <cy-icon :icon="icon" :class="iconClass" width="1.125rem" />
    </div>
    <div class="flex flex-wrap pl-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useDevice } from '@/shared/composables/Device'

const homeLinkGroupIconClassMap = {
  fuchsia: 'text-fuchsia-30',
  emerald: 'text-emerald-30',
  gray: 'text-gray-30',
} as const

type HomeLinkGroupColor = keyof typeof homeLinkGroupIconClassMap

interface Props {
  icon: string
  color: HomeLinkGroupColor
}

const props = defineProps<Props>()

const { device } = useDevice()

const iconClass = computed(() => homeLinkGroupIconClassMap[props.color])
</script>
