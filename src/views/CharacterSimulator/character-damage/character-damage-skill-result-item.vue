<template>
  <div class="flex items-center">
    <div class="border border-orange rounded-sm py-0.5 px-2 mr-2 bg-white text-orange text-sm">
      {{ result.container.get('name') }}
    </div>
    <div class="flex items-center space-x-0.5">
      <div class="text-light-3">
        {{ valid ? expectedResult : '--' }}
      </div>
      <cy-icon-text
        v-if="frequencyVisible && result.container.get('frequency')"
        icon="ic-round-close"
      />
      <span
        v-if="frequencyVisible"
        class="attr-item"
        v-html="result.container.get('frequency')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillResult } from '@/stores/views/character/setup'

import { isNumberString } from '@/shared/utils/string'

import { setupCharacterStore } from '../setup'

interface Props {
  result: SkillResult;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()

const valid = computed(() => {
  const constant = props.result.container.getValue('constant')
  const multiplier = props.result.container.getValue('multiplier')
  return isNumberString(constant) && isNumberString(multiplier)
})

const skillProperties = computed(() => {
  if (!valid.value) {
    return {
      skillRealMpCost: 0,
      skillConstant: 0,
      skillMultiplier: 0,
    }
  }
  const constant = props.result.container.getValue('constant')
  const multiplier = props.result.container.getValue('multiplier')
  return {
    skillRealMpCost: 0,
    skillConstant: parseInt(constant, 10),
    skillMultiplier: parseInt(multiplier, 10),
  }
})

const { expectedResult } = store.setupDamageCalculationExpectedResult(
  skillProperties,
  computed(() => store.targetProperties),
  computed(() => store.calculationOptions),
)

const frequencyVisible = computed(() => {
  return props.result.container.branchItem.attr('title') === 'each'
})
</script>
