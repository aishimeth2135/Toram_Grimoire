<template>
  <div>
    <div v-if="title" class="flex items-center relative">
      <div class="flex items-center flex-shrink-0">
        <div class="text-stone-90 pl-2 pr-3">{{ title }}</div>
        <cy-icon-text :icon="titleIcon" icon-color="primary-30" />
      </div>
      <div class="w-full ml-4 border-t border-primary-20"></div>
      <div class="absolute right-0 top-1 w-3.5 h-3.5 bg-primary-20"></div>
    </div>
    <div class="pt-3.5 px-2 text-stone-50">
      <slot name="caption" />
    </div>
    <div v-if="slots['caption-sub']" class="flex items-center flex-wrap pt-2 pb-2 pl-4 pr-2">
      <slot name="caption-sub" />
    </div>
    <div class="pt-1.5 px-2">
      <slot name="actions" />
    </div>
    <slot name="extra-rows" />
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

interface Props {
  title?: string;
  titleIcon?: string;
}

defineProps<Props>()

const slots = useSlots()
</script>
