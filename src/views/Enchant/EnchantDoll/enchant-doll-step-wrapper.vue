<template>
  <div>
    <div class="step-wrapper-content">
      <slot />
      <cy-transition>
        <div v-if="currentStep > stepId" class="step-wrapper-disabled-mask" @click="maskClick" />
      </cy-transition>
    </div>
    <div v-if="currentStep > stepId" class="mb-4 flex justify-center">
      <cy-button-action icon="mdi-leaf" color="orange" @click="backToStep(stepId)">
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-action>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from '@/shared/setup/Notify'

import { EnchantDollInjectionKey } from './injection-keys'
import { StepIds } from './setup'

interface Props {
  stepId: StepIds
}

defineProps<Props>()

const { currentStep, backToStep } = inject(EnchantDollInjectionKey)!

const { t } = useI18n()
const { notify } = Notify()

const maskClick = () => {
  notify(t('enchant-doll.tips.cannot-directly-modify-previous-step'))
}
</script>

<style scoped>
.step-wrapper-content {
  padding: 2rem 1rem;
  min-height: 70vh;
  position: relative;

  & + .content {
    border-top: 1px solid var(--app-fuchsia-60);
  }
}

.step-wrapper-disabled-mask {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  height: 100%;
  width: 100%;
  cursor: not-allowed;
  background-color: --alpha(var(--app-white) / 60%);
}
</style>
