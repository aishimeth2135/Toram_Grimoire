<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="p-4 wd:flex wd:items-start">
    <div
      class="mr-2 mb-4 flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-5"
    >
      <cy-icon :icon="icon" width="1.5rem" />
    </div>
    <div class="px-4">
      <slot />
    </div>
  </div>
</template>
