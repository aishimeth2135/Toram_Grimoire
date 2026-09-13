<template>
  <div class="flex flex-wrap items-center p-1 pr-3 pb-0.5">
    <div class="mt-0.5">
      <cy-input-counter
        v-if="computing.config.formulaDisplayMode === FormulaDisplayModes.Normal"
        v-model:value="stackValue"
        :range="stackValueRange"
        :input-width="container.getCustomData('stackInputWidth')"
        :step="stackStep"
        :title="container.get('name')"
      >
        <template v-if="container.get('unit')" #unit>
          <span class="text-primary-50">{{ container.get('unit') }}</span>
        </template>
      </cy-input-counter>
      <div v-else class="border border-blue-30 px-3 py-1.5 text-blue-60">
        {{ container.get('name') }}
      </div>
    </div>
    <div class="mt-0.5 ml-4 flex items-center space-x-1 text-primary-30">
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

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import { ComputingContainerInjectionKey } from '../injection-keys'
import StackHandler from './branch-handlers/StackHandler'

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
