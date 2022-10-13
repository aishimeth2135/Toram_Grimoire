<template>
  <div
    class="flex flex-shrink-0 justify-center rounded-full border border-primary-30 bg-white p-1.5"
  >
    <cy-icon-text :icon="icon" icon-color="primary-30" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string
}

defineProps<Props>()
</script>
