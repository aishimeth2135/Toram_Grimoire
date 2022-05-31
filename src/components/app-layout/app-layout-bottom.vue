<template>
  <div class="sticky bottom-0 p-2 z-20 pointer-events-none w-full mt-auto">
    <cy-transition type="fade" mode="out-in">
      <div v-if="hasMainContent" class="mb-2 pointer-events-auto">
        <slot name="main-content"></slot>
      </div>
      <div v-else-if="slots['side-buttons'] || slots['side-contents']" class="flex items-end justify-end mb-2 space-x-2">
        <div v-if="slots['side-contents']" class="pointer-events-auto pl-0.5">
          <slot name="side-contents"></slot>
        </div>
        <div v-if="slots['side-buttons']" class="flex flex-col items-end space-y-2 pointer-events-auto">
          <slot name="side-buttons"></slot>
        </div>
      </div>
    </cy-transition>
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
import { useSlots, Comment, computed } from 'vue'

const slots = useSlots()

const hasMainContent = computed(() => {
  const getter = slots['main-content']
  if (!getter) {
    return false
  }
  const content = getter()
  return content.length > 0 && content.some(item => item.type !== Comment)
})
</script>
