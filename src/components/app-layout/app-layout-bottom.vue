<template>
  <div class="app-layout--bottom app-layout-horizontal-container">
    <cy-transition mode="out-in">
      <div
        v-if="slotNotEmpty(slots['main-content'])"
        class="pointer-events-auto mb-2"
      >
        <slot name="main-content"></slot>
      </div>
      <div
        v-else-if="slots['side-buttons'] || slots['side-contents']"
        class="mb-2 flex items-end justify-end space-x-2"
      >
        <div v-if="slots['side-contents']" class="pointer-events-auto pl-0.5">
          <slot name="side-contents"></slot>
        </div>
        <div
          v-if="slots['side-buttons']"
          class="pointer-events-auto flex flex-col items-end space-y-2"
        >
          <slot name="side-buttons"></slot>
        </div>
      </div>
    </cy-transition>
    <div
      v-if="slots['default'] || slots['main-start'] || slots['main-end']"
      class="flex items-end space-x-2"
    >
      <div v-if="slots['main-start']" class="pointer-events-auto">
        <slot name="main-start"></slot>
      </div>
      <div
        v-if="slots['default']"
        class="pointer-events-auto w-full rounded-full border-1 border-primary-30 bg-white px-3 py-1 shadow"
      >
        <slot></slot>
      </div>
      <div v-if="slots['main-end']" class="pointer-events-auto ml-auto">
        <slot name="main-end"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

import { slotNotEmpty } from '@/shared/utils/vue'

const slots = useSlots()
</script>
