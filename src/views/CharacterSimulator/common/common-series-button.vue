<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="common-series-button">
    <cy-icon :icon="icon" class="text-current" />
  </div>
</template>

<style lang="postcss" scoped>
.common-series-button {
  @apply inline-flex cursor-pointer rounded border-1 border-current bg-white px-2 py-1.5 text-primary-20 duration-150;
}

.common-series-button.button-selected {
  @apply z-1 text-primary-50;
}

.common-series-button:hover {
  @apply z-1 text-primary-40;
}

.common-series-button + .common-series-button {
  @apply -ml-0.5;
}
</style>
