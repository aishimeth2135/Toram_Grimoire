<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="wd:flex wd:items-start p-4">
    <div
      class="bg-primary-5 mb-4 mr-2 flex size-16 shrink-0 items-center justify-center rounded-full"
    >
      <cy-icon :icon="icon" width="1.5rem" />
    </div>
    <div class="px-4">
      <slot />
    </div>
  </div>
</template>
