<script lang="ts" setup>
interface Props {
  text: string
}

defineProps<Props>()
</script>

<template>
  <div class="gap-icon flex items-start text-sm">
    <cy-icon class="icon-first-line" small icon="bx-bx-error-circle" />
    <div class="text-primary-60">
      {{ text }}
    </div>
  </div>
</template>
