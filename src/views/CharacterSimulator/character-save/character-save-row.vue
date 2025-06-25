<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="p-4 wd:flex wd:items-start">
    <div
      class="mb-4 mr-2 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-5"
    >
      <cy-icon :icon="icon" width="1.5rem" />
    </div>
    <div class="px-4">
      <slot />
    </div>
  </div>
</template>
