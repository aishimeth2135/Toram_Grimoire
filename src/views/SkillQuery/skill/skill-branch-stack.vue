<template>
  <div class="flex flex-wrap items-center p-1 pb-0.5 pr-3">
    <div class="mt-0.5">
      <cy-input-counter
        v-if="
          computing.config.formulaDisplayMode === FormulaDisplayModes.Normal
        "
        v-model:value="stackValue"
        :range="stackValueRange"
        :input-width="container.getCustomData('stackInputWidth')"
        :step="stackStep"
      >
        <template #title>
          <cy-icon-text icon="ion-leaf">
            {{ container.get('name') }}
          </cy-icon-text>
        </template>
        <template v-if="container.get('unit')" #unit>
          <span class="text-primary-50">{{ container.get('unit') }}</span>
        </template>
      </cy-input-counter>
      <cy-icon-text v-else icon="ion-leaf">
        {{ container.get('name') }}
      </cy-icon-text>
    </div>
    <div class="ml-4 mt-0.5 flex items-center space-x-1">
      <cy-icon-text
        icon="icon-park-outline:inner-shadow-top-right"
        class="mr-2"
      />
      <div v-if="stackValueRangeOrigin[0]" class="text-primary-50">
        {{ stackValueRangeOrigin[0] }}
      </div>
      <cy-icon-text icon="mdi:tilde" icon-width="0.8rem" />
      <div v-if="stackValueRangeOrigin[1]" class="text-primary-50">
        {{ stackValueRangeOrigin[1] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, computed, inject, toRefs } from 'vue'
import type { WritableComputedRef } from 'vue'

import { isNumberString } from '@/shared/utils/string'

import {
  SkillBranchItem,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputingContainer'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputingContainer'

import { ComputingContainerInjectionKey } from '../injection-keys'
import StackHandler from './branch-handlers/StackHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const { setStackValue } = inject(ComputingContainerInjectionKey)!

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() =>
  StackHandler(props.computing, branchItem.value)
)

const stackState = computed(() => {
  return branchItem.value.parent.getStackState(branchItem.value.stackId!)
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

const stackStep = computed(() => {
  const step = container.value.get('step')
  return isNumberString(step) ? parseInt(step, 10) : 1
})
</script>
