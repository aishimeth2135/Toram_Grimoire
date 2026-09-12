<script lang="ts" setup>
import { shallowRef, triggerRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { ChromaticTransContainer, type ChromaticTransGem } from '@/lib/ChromaticTrans'

import DyeColorButton from '@/components/common/dye-color-button.vue'

import ChromaticTransStepMain from './chromatic-trans-step-main.vue'

const { t } = useI18n()
const container = shallowRef<ChromaticTransContainer>(new ChromaticTransContainer())
const expandedSteps = shallowRef<Set<number>>(new Set([0]))

function selectGem(index: number, gem: ChromaticTransGem) {
  container.value.selectGem(index, gem)
  triggerRef(container)
  if (container.value.steps[index + 1]) {
    expandedSteps.value = new Set([...expandedSteps.value, index + 1])
  }
}

function toggleStep(index: number) {
  const next = new Set(expandedSteps.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  expandedSteps.value = next
}

function resetSteps() {
  container.value = new ChromaticTransContainer()
  expandedSteps.value = new Set([0])
}
</script>

<template>
  <div class="space-y-4 py-4">
    <div class="flex justify-end">
      <cy-button-plain icon="mdi:restart" class="text-sm" @click="resetSteps">
        {{ t('chromatic-trans-simulator.reset-steps') }}
      </cy-button-plain>
    </div>
    <ChromaticTransStepMain
      v-for="step in container.steps"
      :key="step.index"
      :container="container"
      :step="step"
      :expanded="expandedSteps.has(step.index)"
      @select="selectGem(step.index, $event)"
      @toggle="toggleStep(step.index)"
    />
    <section class="border-primary-20 rounded-sm border p-3 pt-2" aria-live="polite">
      <h3 class="text-primary-60 mb-3 text-sm">
        {{ t('chromatic-trans-simulator.result-title') }}
      </h3>
      <div v-if="container.pool.length" class="flex flex-wrap gap-1">
        <DyeColorButton
          v-for="color in container.pool"
          :key="color"
          :color="color"
          class="h-7 w-10"
          :tabindex="-1"
        />
      </div>
      <p v-else class="text-primary-40 text-sm">{{ t('chromatic-trans-simulator.empty') }}</p>
    </section>
  </div>
</template>
