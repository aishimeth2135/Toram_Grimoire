<template>
  <div class="flex justify-center bg-white border border-primary-30 rounded-full p-1.5 flex-shrink-0">
    <cy-icon-text :icon="icon" icon-color="primary-30" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string;
}

defineProps<Props>()
</script>
