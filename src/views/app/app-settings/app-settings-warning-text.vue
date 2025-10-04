<script lang="ts" setup>
interface Props {
  text: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex">
    <cy-icon class="h-text-sm" small icon="bx-bx-error-circle" />
    <div class="ml-1.5 text-sm text-primary-60">
      {{ text }}
    </div>
  </div>
</template>
