<template>
  <div
    class="flex flex-shrink-0 justify-center rounded-full border bg-white p-1.5"
    :class="`border-${iconColor}`"
  >
    <cy-icon :icon="icon" :color="iconColor" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary-30',
})
</script>
