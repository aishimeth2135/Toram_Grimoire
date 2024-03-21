<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  icon: string
  primary?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    class="relative -mt-2 inline-flex cursor-pointer rounded border-1 border-primary-10 bg-white px-3.5 pb-2 pt-3.5 duration-150 hover:border-primary-30"
  >
    <div
      v-if="primary"
      class="absolute left-1 top-1 -z-1 h-full w-full bg-primary-10"
    />
    <cy-icon :icon="icon" />
  </div>
</template>
