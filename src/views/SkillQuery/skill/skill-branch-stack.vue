<template>
  <div class="p-1 pr-3 flex items-center flex-wrap">
    <cy-input-counter
      v-if="branchItem.parent.parent.parent.config.formulaDisplayMode === FormulaDisplayModes.Normal"
      v-model:value="stackValue"
      :range="stackValueRange"
      :input-width="container.customDatas.stackInputWidth"
    >
      <template #title>
        <cy-icon-text icon="ion-leaf">
          {{ container.get('name') }}
        </cy-icon-text>
      </template>
      <template v-if="container.get('unit')" #unit>
        <span class="text-light-3">{{ container.get('unit') }}</span>
      </template>
    </cy-input-counter>
    <cy-icon-text v-else icon="ion-leaf">
      {{ container.get('name') }}
    </cy-icon-text>
    <div class="flex items-center space-x-1 ml-4">
      <cy-icon-text icon="icon-park-outline:inner-shadow-top-right" class="mr-2" />
      <div v-if="stackValueRangeOrigin[0]" class="text-light-3">{{ stackValueRangeOrigin[0] }}</div>
      <cy-icon-text icon="mdi:tilde" icon-width="0.8rem" />
      <div v-if="stackValueRangeOrigin[1]" class="text-light-3">{{ stackValueRangeOrigin[1] }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, inject, ComputedRef } from 'vue'
import type { WritableComputedRef } from 'vue'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer/enums'

import { findStackState } from '../utils'
import { ComputingContainerInjectionKey } from '../injection-keys'
import StackHandler from './branch-handlers/StackHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const { setStackValue } = inject(ComputingContainerInjectionKey)!

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => StackHandler(branchItem.value))

const stackState = computed(() => {
  return findStackState(branchItem.value.parent, branchItem.value.stackId as number)
})

const stackValue: WritableComputedRef<number> = computed({
  set(value) {
    setStackValue(branchItem.value, value)
  },
  get() {
    return stackState.value?.value ?? 0
  },
})

const stackValueRangeOrigin: ComputedRef<[string, string]> = computed(() => {
  return [container.value.get('min'), container.value.get('max')]
})

const stackValueRange = computed(() => {
  let max: number | null = parseInt(stackValueRangeOrigin.value[1], 10)
  let min: number | null = parseInt(stackValueRangeOrigin.value[0], 10)

  max = !Number.isNaN(max) ? max : null
  min = !Number.isNaN(min) ? min : null

  return [min, max]
})
</script>

