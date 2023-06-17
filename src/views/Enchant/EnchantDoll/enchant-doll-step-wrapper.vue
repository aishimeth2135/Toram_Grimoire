<template>
  <div>
    <div :class="classes.content">
      <slot />
      <cy-transition>
        <div
          v-if="currentStep > stepId"
          class="disabled-mask"
          @click="maskClick"
        />
      </cy-transition>
    </div>
    <div v-if="currentStep > stepId" class="mb-4 flex justify-center">
      <cy-button-action
        icon="mdi-leaf"
        color="orange"
        @click="backToStep(stepId)"
      >
        {{ t('enchant-doll.back-to-step') }}
      </cy-button-action>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, useCssModule } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from '@/shared/setup/Notify'

import { EnchantDollInjectionKey } from './injection-keys'
import { StepIds } from './setup'

interface Props {
  stepId: StepIds
}

defineProps<Props>()

const classes = useCssModule()

const { currentStep, backToStep } = inject(EnchantDollInjectionKey)!

const { t } = useI18n()
const { notify } = Notify()

const maskClick = () => {
  notify(t('enchant-doll.tips.cannot-directly-modify-previous-step'))
}
</script>

<style lang="postcss" module>
.content {
  padding: 2rem 1rem;
  min-height: 70vh;
  position: relative;

  & + .content {
    border-top: 1px solid var(--app-fuchsia-60);
  }
}

.disabled-mask {
  @apply absolute left-0 top-0 z-5 h-full w-full cursor-not-allowed;

  background-color: rgba(var(--app-rgb-white), 0.6);
}
</style>
