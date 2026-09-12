<script lang="ts" setup>
import { CHROMATIC_COLORS } from '@/lib/ChromaticTrans/gems'

import DyeColorButton from '@/components/common/dye-color-button.vue'

interface Props {
  pool: readonly number[]
}

defineProps<Props>()
</script>

<template>
  <div class="overflow-x-auto">
    <div class="grid-rows-16 grid w-max grid-flow-col grid-cols-5 gap-px">
      <DyeColorButton
        v-for="color in CHROMATIC_COLORS"
        :key="color"
        :color="color"
        class="h-6 w-8 text-sm"
        :class="{ 'opacity-30': !pool.includes(color) }"
        :tabindex="-1"
      />
    </div>
  </div>
</template>
