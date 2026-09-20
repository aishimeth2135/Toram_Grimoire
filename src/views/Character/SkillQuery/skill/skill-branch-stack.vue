<template>
  <div class="flex flex-wrap items-center p-1 pb-0.5 pr-3">
    <div class="mt-0.5">
      <cy-input-counter
        v-if="computing.config.formulaDisplayMode === FormulaDisplayModes.Normal"
        v-model:value="stackValue"
        :range="stackValueRange"
        :input-width="getStackInputWidth(container)"
        :step="stackStep"
        :title="container.get('name')"
      >
        <template v-if="container.get('unit')" #unit>
          <span class="text-primary-50">{{ container.get('unit') }}</span>
        </template>
      </cy-input-counter>
      <div v-else class="border-blue-30 text-blue-60 border px-3 py-1.5">
        {{ container.get('name') }}
      </div>
    </div>
    <div class="text-primary-30 ml-4 mt-0.5 flex items-center space-x-1">
      <cy-icon icon="icon-park-outline:inner-shadow-top-right" class="mr-2" />
      <skill-branch-prop-value v-if="container.has('min')" :result="container.result('min')" />
      <cy-icon icon="mdi:tilde" width="0.8rem" />
      <skill-branch-prop-value v-if="container.has('max')" :result="container.result('max')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, toRefs } from 'vue'
import type { ComputedRef, WritableComputedRef } from 'vue'

import { toInt } from '@/shared/utils/number'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'
import { FormulaDisplayModes } from '@/lib/Skill/SkillComputing'
import { StackHandler, getStackInputWidth } from '@/lib/Skill/SkillDisplay'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import { ComputingContainerInjectionKey } from '../injection-keys'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const { setStackValue } = inject(ComputingContainerInjectionKey)!

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => StackHandler(props.computing, branchItem.value))

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
  const max = toInt(stackValueRangeOrigin.value[1])
  const min = toInt(stackValueRangeOrigin.value[0])

  return [min, max]
})

const stackStep = computed(() => toInt(container.value.get('step')) ?? 1)
</script>
