<template>
  <div>
    <div v-if="title" class="relative flex items-center">
      <div class="flex flex-shrink-0 items-center">
        <div class="pl-2 pr-3 text-stone-90">{{ title }}</div>
        <cy-icon-text :icon="titleIcon" icon-color="primary-30" />
      </div>
      <div class="ml-4 w-full border-t border-primary-20"></div>
      <div class="absolute right-0 top-1 h-3.5 w-3.5 bg-primary-20"></div>
    </div>
    <div class="px-2 pt-3.5 text-stone-50">
      <slot name="caption" />
    </div>
    <div
      v-if="slots['caption-sub']"
      class="flex flex-wrap items-center pt-2 pb-2 pl-4 pr-2"
    >
      <slot name="caption-sub" />
    </div>
    <div class="px-2 pt-1.5">
      <slot name="actions" />
    </div>
    <slot name="extra-rows" />
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

interface Props {
  title?: string
  titleIcon?: string
}

defineProps<Props>()

const slots = useSlots()
</script>
