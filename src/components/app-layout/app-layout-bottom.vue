<template>
  <div class="sticky bottom-0 p-2 z-20 pointer-events-none">
    <div v-if="slots['side-buttons'] || slots['side-contents']" class="flex items-end justify-end mb-2 space-x-2">
      <div v-if="slots['side-contents']" class="pointer-events-auto pl-0.5">
        <slot name="side-contents"></slot>
      </div>
      <div v-if="slots['side-buttons']" class="flex flex-col items-end space-y-2 pointer-events-auto">
        <slot name="side-buttons"></slot>
      </div>
    </div>
    <div v-if="slots['default'] || slots['main-start']  || slots['main-end']" class="flex items-end space-x-2">
      <div v-if="slots['main-start']" class="pointer-events-auto">
        <slot name="main-start"></slot>
      </div>
      <div v-if="slots['default']" class="border-1 border-light-2 px-3 py-1 rounded-full bg-white shadow w-full pointer-events-auto">
        <slot></slot>
      </div>
      <div v-if="slots['main-end']" class="ml-auto pointer-events-auto">
        <slot name="main-end"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>
