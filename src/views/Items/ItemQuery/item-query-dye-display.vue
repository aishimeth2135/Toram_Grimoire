<script lang="ts" setup>
import { computed } from 'vue'

import DyeColorButton from '@/components/common/dye-color-button.vue'

import { dyeConvert } from './setup'

interface Props {
  dye: string
}

const props = defineProps<Props>()

const dyeParts = ['A', 'B', 'C'] as const
const dyeColors = computed<(number | null)[]>(() => dyeConvert(props.dye))
</script>

<template>
  <div class="ml-3 inline-flex shrink-0 items-center gap-icon text-sm text-primary-90">
    <cy-icon icon="ic-outline-palette" small class="text-primary-30" />
    <div class="flex items-center space-x-2">
      <template v-for="(color, index) in dyeColors" :key="dyeParts[index]">
        <span v-if="color !== null" class="inline-flex items-center">
          <DyeColorButton
            :color="color"
            class="mr-1 size-3 overflow-hidden text-[0px] leading-none"
            tabindex="-1"
            aria-hidden="true"
          />
          {{ dyeParts[index] }}{{ color }}
        </span>
      </template>
    </div>
  </div>
</template>
