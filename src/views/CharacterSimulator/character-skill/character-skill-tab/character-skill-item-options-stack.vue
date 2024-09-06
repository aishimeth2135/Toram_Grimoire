<template>
  <div class="flex flex-wrap items-center p-1 pr-3">
    <div class="mr-2 mt-0.5">
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
    <div class="mt-0.5 flex items-center space-x-1 pl-2">
      <cy-icon icon="icon-park-outline:inner-shadow-top-right" class="mr-2" />
      <div v-if="stackValueRangeOrigin[0]" class="text-primary-50">
        {{ stackValueRangeOrigin[0] }}
      </div>
      <cy-icon icon="mdi:tilde" width="0.75rem" />
      <div v-if="stackValueRangeOrigin[1]" class="text-primary-50">
        {{ stackValueRangeOrigin[1] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComputedRef, WritableComputedRef } from 'vue'
import { computed, toRefs } from 'vue'

import { toInt } from '@/shared/utils/number'

import { SkillBranchItem } from '@/lib/Skill/SkillComputing'

import DisplayDataContainer from '@/views/SkillQuery/skill/branch-handlers/handle/DisplayDataContainer'

import { setStackValue } from './utils'

interface Props {
  container: DisplayDataContainer<SkillBranchItem>
}

const props = defineProps<Props>()

const { container } = toRefs(props)

const stackState = computed(() => {
  return container.value.branchItem.parent.getStackState(
    container.value.branchItem.stackId as number
  )
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
  const max = toInt(stackValueRangeOrigin.value[1])
  const min = toInt(stackValueRangeOrigin.value[0])
  return [min, max]
})
</script>
