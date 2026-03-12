<script lang="ts" setup>
interface Props {
  selected: boolean
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'ic:round-check',
})
</script>

<template>
  <cy-icon :icon="icon" class="text-red-60" :class="{ 'opacity-10': !selected }" />
</template>
