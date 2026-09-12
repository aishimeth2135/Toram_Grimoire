<script lang="ts" setup>
import { GRAYSCALE_COLORS } from '@/lib/ChromaticTrans/gems'

import DyeColorButton from '@/components/common/dye-color-button.vue'

interface Props {
  pool: readonly number[]
}

defineProps<Props>()
</script>

<template>
  <div class="flex w-max gap-px">
    <DyeColorButton
      v-for="color in GRAYSCALE_COLORS"
      :key="color"
      :color="color"
      class="h-6 w-8 text-sm"
      :class="{ 'opacity-20': !pool.includes(color) }"
      :tabindex="-1"
    />
  </div>
</template>
