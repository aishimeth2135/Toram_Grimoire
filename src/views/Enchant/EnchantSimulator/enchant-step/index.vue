<!-- this component is splitted to handle EnchantStep -->
<template>
  <div
    class="flex h-full flex-col border bg-white px-2 pt-1"
    style="min-height: 12.5rem"
    :class="{ [mainBorderColor]: true, 'opacity-50': step.hidden }"
  >
    <div class="flex items-center border-b py-0.5 pl-2" :class="[mainBorderColor]">
      <div
        class="gap-icon inline-flex items-center text-sm"
        :class="{
          'text-blue-60': step.isLastStep,
          'text-gray-60': step.afterLastStep,
          'text-fuchsia-70': !step.isLastStep && !step.afterLastStep,
        }"
      >
        <cy-icon icon="bx-bxs-book-content" small />
        {{ stepTitle }}
      </div>
      <div class="ml-auto mr-1 inline-flex items-center">
        <cy-popover class="flex">
          <template #default="{ shown }">
            <cy-button-icon icon="gg-menu-left-alt" class="p-0" :selected="shown" />
          </template>
          <template #popper="{ hide }">
            <div @click="hide">
              <cy-list-item @click="insertStepBefore">
                <div class="gap-icon text-primary-90 inline-flex items-center">
                  <cy-icon icon="mdi-table-row-plus-before" class="text-primary-30" />
                  {{ t('enchant-simulator.step.insert-step-before') }}
                </div>
              </cy-list-item>
              <cy-list-item v-if="step.index !== 0" @click="swapStep(-1)">
                <div class="gap-icon text-primary-90 inline-flex items-center">
                  <cy-icon icon="eva-arrow-ios-upward-fill" class="text-primary-30" />
                  {{ t('enchant-simulator.step.step-move-up') }}
                </div>
              </cy-list-item>
              <cy-list-item v-if="!step.isLastStep" @click="swapStep(1)">
                <div class="gap-icon text-primary-90 inline-flex items-center">
                  <cy-icon icon="eva-arrow-ios-downward-outline" class="text-primary-30" />
                  {{ t('enchant-simulator.step.step-move-down') }}
                </div>
              </cy-list-item>
            </div>
          </template>
        </cy-popover>
        <cy-button-icon
          :icon="step.hidden ? 'mdi-checkbox-blank-off-outline' : 'mdi-checkbox-blank-outline'"
          class="p-0"
          :class="step.hidden ? 'text-orange-60' : 'text-red-30'"
          @click="step.hidden = !step.hidden /* eslint-disable-line vue/no-mutating-props */"
        />
        <cy-button-icon icon="jam-close-circle" class="text-gray-60 p-0" @click="step.remove()" />
      </div>
    </div>
    <div class="p-1">
      <template v-if="step.stats.length !== 0">
        <EnchantStepStatView
          v-for="(stat, idx) in step.stats"
          :key="stat.statId"
          :stat="stat"
          :class="idx !== 0 ? 'border-primary-30 border-t' : ''"
        />
      </template>
      <div v-else-if="step.index === 0" class="px-2 pb-2 pt-3">
        <div>
          <div class="gap-icon text-fuchsia-60 inline-flex items-center text-sm">
            <cy-icon small class="text-primary-30" />
            {{ t('enchant-simulator.step.button-caption-title') }}
          </div>
        </div>
        <div class="pl-2">
          <div>
            <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
              <cy-icon icon="ic-round-add-circle-outline" small class="text-blue-60" />
              {{ t('enchant-simulator.step.select-one-stat-item') }}
            </div>
          </div>
          <div>
            <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
              <cy-icon icon="ic-round-add-circle-outline" small class="text-orange-60" />
              {{ t('enchant-simulator.step.select-multiple-stat-items') }}
            </div>
          </div>
          <div>
            <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
              <cy-icon icon="ic-outline-near-me" small class="text-cyan-60" />
              {{ t('enchant-simulator.step.step-type-each') }}
            </div>
          </div>
          <div>
            <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
              <cy-icon icon="ant-design:star-outlined" small class="text-orange-60" />
              {{ t('enchant-simulator.step.auto-fill-positive-stat') }}
            </div>
          </div>
        </div>
      </div>
      <cy-default-tips v-else icon="fluent-leaf-two-16-filled">
        {{ t('enchant-simulator.tips.step-empty') }}
      </cy-default-tips>
    </div>
    <div class="border-fuchsia-60 mt-auto border-t pt-0.5">
      <cy-transition>
        <div v-if="isTypeEach" class="border-primary-30 border-b py-0.5">
          <cy-input-counter
            v-model:value="step.step /* eslint-disable-line vue/no-mutating-props */"
            inline
            color="cyan"
          >
            <template #title>
              <div class="gap-icon text-primary-90 inline-flex items-center">
                <cy-icon icon="ic-outline-near-me" class="text-cyan-60" />
                {{ t('enchant-simulator.step.step-type-each-title') }}
              </div>
            </template>
          </cy-input-counter>
        </div>
      </cy-transition>
      <div class="flex items-center py-0.5">
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          class="text-blue-60"
          @click="openSelectItem('step', step, true)"
        />
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          class="text-orange-60"
          @click="openSelectItem('step', step)"
        />
        <cy-button-icon
          :icon="typeIcon"
          color="emerald"
          :selected="isTypeEach"
          @click="toggleStepType"
        />
        <cy-button-icon
          v-if="step.belongEquipment.stats(step.index - 1).length >= 6"
          icon="ant-design:star-outlined"
          class="text-orange-60"
          @click="step.autoFill()"
        />
        <div class="gap-icon text-fuchsia-60 ml-auto mr-2 inline-flex items-center">
          <cy-icon icon="mdi-creation" class="text-primary-30" />
          {{ step.remainingPotential }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { EnchantStep, EnchantStepTypes } from '@/lib/Enchant/Enchant'

import EnchantStepStatView from './enchant-step-stat.vue'

import { EnchantSimulatorInjectionKey } from '../injection-keys'

defineOptions({
  name: 'EnchantStep',
})

interface Props {
  step: EnchantStep
}

const props = defineProps<Props>()

const { step } = toRefs(props)
const { t } = useI18n()

const { openSelectItem } = inject(EnchantSimulatorInjectionKey)!

const typeIcon = computed(() =>
  step.value.type === EnchantStepTypes.Normal ? 'ic-outline-near-me-disabled' : 'ic-outline-near-me'
)

const isTypeEach = computed(() => step.value.type === EnchantStepTypes.Each)

const mainBorderColor = computed(() => {
  if (step.value.isLastStep) {
    return 'border-blue-60'
  }
  if (step.value.afterLastStep) {
    return 'border-gray-60'
  }
  return 'border-fuchsia-60'
})
const stepTitle = computed(() => {
  if (step.value.isLastStep) {
    return t('enchant-simulator.last-step')
  }
  if (step.value.afterLastStep) {
    return t('enchant-simulator.invalid-step')
  }
  return t('enchant-simulator.enchant-step') + ' ' + (step.value.index + 1).toString()
})

const toggleStepType = () => {
  step.value.type =
    step.value.type === EnchantStepTypes.Normal ? EnchantStepTypes.Each : EnchantStepTypes.Normal
}
const swapStep = (offset: number) => {
  const index = step.value.index
  step.value.belongEquipment.swapStep(index, index + offset)
}
const insertStepBefore = () => {
  step.value.belongEquipment.insertStepBefore(step.value)
}
</script>
