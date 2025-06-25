<script lang="ts" setup>
interface Props {
  selected: boolean
}

defineProps<Props>()
</script>

<template>
  <cy-icon icon="ic:round-check" class="mr-3.5 text-red-50" :class="{ 'opacity-10': !selected }" />
</template>
