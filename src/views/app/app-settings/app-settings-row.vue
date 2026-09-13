<template>
  <div>
    <div v-if="title" class="relative flex items-center">
      <div class="text-gray-90 flex shrink-0 items-center px-2">
        {{ title }}
      </div>
      <div class="border-primary-20 ml-4 w-full border-t"></div>
      <div class="bg-primary-20 absolute right-0 top-1 size-3.5"></div>
    </div>
    <div class="mt-2 px-2 text-sm text-gray-50">
      <slot name="caption" />
    </div>
    <div
      v-if="slotNotEmpty(slots['caption-sub'])"
      class="flex flex-wrap items-center space-x-2 p-2"
    >
      <slot name="caption-sub" />
    </div>
    <div class="px-2 pt-1">
      <slot name="actions" />
    </div>
    <div v-if="slotNotEmpty(slots['extra-rows'])" class="mt-3 space-y-3">
      <slot name="extra-rows" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

import { slotNotEmpty } from '@/shared/utils/vue'

interface Props {
  title?: string
}

defineProps<Props>()

const slots = useSlots()
</script>
