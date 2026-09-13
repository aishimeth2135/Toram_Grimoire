<script lang="ts" setup>
import { getChromaticColors } from '@/lib/Items/Dye/DyeColors'

import DyeColorButton from '@/components/common/dye-color-button.vue'

interface Props {
  pool: readonly number[]
}

const chromaticColors = getChromaticColors()

defineProps<Props>()
</script>

<template>
  <div class="overflow-x-auto">
    <div class="grid w-max grid-flow-col grid-cols-5 grid-rows-16 gap-px">
      <DyeColorButton
        v-for="color in chromaticColors"
        :key="color"
        :color="color"
        class="h-6 w-8 text-sm"
        :class="{ 'opacity-30': !pool.includes(color) }"
        :tabindex="-1"
      />
    </div>
  </div>
</template>
