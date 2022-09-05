<template>
  <div class="p-1 pr-3 flex items-center flex-wrap">
    <div class="mt-0.5 mr-2">
      <cy-input-counter
        v-model:value="stackValue"
        :range="stackValueRange"
        :input-width="container.getCustomData('stackInputWidth')"
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
    </div>
    <div class="flex items-center space-x-1 pl-2 mt-0.5">
      <cy-icon-text icon="icon-park-outline:inner-shadow-top-right" class="mr-2" />
      <div v-if="stackValueRangeOrigin[0]" class="text-primary-50">{{ stackValueRangeOrigin[0] }}</div>
      <cy-icon-text icon="mdi:tilde" icon-width="0.75rem" />
      <div v-if="stackValueRangeOrigin[1]" class="text-primary-50">{{ stackValueRangeOrigin[1] }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, ComputedRef } from 'vue'
import type { WritableComputedRef } from 'vue'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'
import { findStackState } from '@/views/SkillQuery/utils'

import { setStackValue } from './utils'

interface Props {
  container: DisplayDataContainer<SkillBranchItem>;
}

const props = defineProps<Props>()

const { container } = toRefs(props)

const stackState = computed(() => {
  return findStackState(container.value.branchItem.parent, container.value.branchItem.stackId as number)
})

const stackValue: WritableComputedRef<number> = computed({
  set(value) {
    setStackValue(container.value.branchItem, value)
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

