<template>
  <div class="sticky bottom-0 p-2 z-10 pointer-events-none">
    <div v-if="slots['side-buttons'] || slots['side-options']" class="flex items-end justify-end mb-2 space-x-2">
      <div v-if="slots['side-options']" class="pointer-events-auto overflow-y-auto" style="max-height: calc(75vh - 4rem)">
        <slot name="side-options"></slot>
      </div>
      <div v-if="slots['side-buttons']" class="flex flex-col space-y-2 pointer-events-auto">
        <slot name="side-buttons"></slot>
      </div>
    </div>
    <div class="flex items-end space-x-2 pointer-events-auto">
      <slot name="main-start"></slot>
      <div class="border-1 border-light-2 px-3 py-1 rounded-full bg-white shadow w-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>
