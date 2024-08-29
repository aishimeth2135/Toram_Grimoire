<!-- this component is splitted to handle EnchantStep -->
<template>
  <div
    class="flex h-full flex-col border bg-white px-2 pt-1"
    style="min-height: 12.5rem"
    :class="{ [mainBorderColor]: true, 'opacity-50': step.hidden }"
  >
    <div
      class="flex items-center border-b py-0.5 pl-2"
      :class="[mainBorderColor]"
    >
      <cy-icon-text
        icon="bx-bxs-book-content"
        small
        :text-color="mainTextColor"
        :icon-color="mainTextColor"
      >
        {{ stepTitle }}
      </cy-icon-text>
      <div class="ml-auto mr-1 inline-flex items-center">
        <cy-popover class="flex">
          <template #default="{ shown }">
            <cy-button-icon
              icon="gg-menu-left-alt"
              class="p-0"
              :selected="shown"
            />
          </template>
          <template #popper="{ hide }">
            <div @click="hide">
              <cy-list-item @click="insertStepBefore">
                <cy-icon-text icon="mdi-table-row-plus-before">
                  {{ t('enchant-simulator.step.insert-step-before') }}
                </cy-icon-text>
              </cy-list-item>
              <cy-list-item v-if="step.index !== 0" @click="swapStep(-1)">
                <cy-icon-text icon="eva-arrow-ios-upward-fill">
                  {{ t('enchant-simulator.step.step-move-up') }}
                </cy-icon-text>
              </cy-list-item>
              <cy-list-item v-if="!step.isLastStep" @click="swapStep(1)">
                <cy-icon-text icon="eva-arrow-ios-downward-outline">
                  {{ t('enchant-simulator.step.step-move-down') }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </template>
        </cy-popover>
        <cy-button-icon
          :icon="
            step.hidden
              ? 'mdi-checkbox-blank-off-outline'
              : 'mdi-checkbox-blank-outline'
          "
          class="p-0"
          :icon-color="step.hidden ? 'orange-60' : 'red-30'"
          @click="
            step.hidden =
              !step.hidden /* eslint-disable-line vue/no-mutating-props */
          "
        />
        <cy-button-icon
          icon="jam-close-circle"
          class="p-0"
          icon-color="gray-60"
          @click="step.remove()"
        />
      </div>
    </div>
    <div class="p-1">
      <template v-if="step.stats.length !== 0">
        <EnchantStepStatView
          v-for="(stat, idx) in step.stats"
          :key="stat.statId"
          :stat="stat"
          :class="idx !== 0 ? 'border-t border-primary-30' : ''"
        />
      </template>
      <div v-else-if="step.index === 0" class="px-2 pb-2 pt-3">
        <div>
          <cy-icon-text small text-color="fuchsia-60">
            {{ t('enchant-simulator.step.button-caption-title') }}
          </cy-icon-text>
        </div>
        <div class="pl-2">
          <div>
            <cy-icon-text
              small
              icon="ic-round-add-circle-outline"
              icon-color="blue-60"
            >
              {{ t('enchant-simulator.step.select-one-stat-item') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              small
              icon="ic-round-add-circle-outline"
              icon-color="orange-60"
            >
              {{ t('enchant-simulator.step.select-multiple-stat-items') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text small icon="ic-outline-near-me" icon-color="cyan-60">
              {{ t('enchant-simulator.step.step-type-each') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              small
              icon="ant-design:star-outlined"
              icon-color="orange-60"
            >
              {{ t('enchant-simulator.step.auto-fill-positive-stat') }}
            </cy-icon-text>
          </div>
        </div>
      </div>
      <cy-default-tips v-else icon="fluent-leaf-two-16-filled">
        {{ t('enchant-simulator.tips.step-empty') }}
      </cy-default-tips>
    </div>
    <div class="mt-auto border-t border-fuchsia-60 pt-0.5">
      <cy-transition>
        <div v-if="isTypeEach" class="border-b border-primary-30 py-0.5">
          <cy-input-counter
            v-model:value="
              step.step /* eslint-disable-line vue/no-mutating-props */
            "
            inline
            main-color="cyan-60"
          >
            <template #title>
              <cy-icon-text icon="ic-outline-near-me" icon-color="cyan-60">
                {{ t('enchant-simulator.step.step-type-each-title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </cy-transition>
      <div class="flex items-center py-0.5">
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          icon-color="blue-60"
          @click="openSelectItem('step', step, true)"
        />
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          icon-color="orange-60"
          @click="openSelectItem('step', step)"
        />
        <cy-button-icon
          :icon="typeIcon"
          :icon-color="isTypeEach ? 'emerald-60' : 'emerald-30'"
          icon-color-hover="emerald-60"
          @click="toggleStepType"
        />
        <cy-button-icon
          v-if="step.belongEquipment.stats(step.index - 1).length >= 6"
          icon="ant-design:star-outlined"
          icon-color="orange-60"
          @click="step.autoFill()"
        />
        <cy-icon-text
          icon="mdi-creation"
          class="ml-auto mr-2"
          text-color="fuchsia-60"
        >
          {{ step.remainingPotential }}
        </cy-icon-text>
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
  step.value.type === EnchantStepTypes.Normal
    ? 'ic-outline-near-me-disabled'
    : 'ic-outline-near-me'
)

const isTypeEach = computed(() => step.value.type === EnchantStepTypes.Each)

const mainTextColor = computed(() => {
  if (step.value.isLastStep) {
    return 'blue-60'
  }
  if (step.value.afterLastStep) {
    return 'gray-60'
  }
  return 'fuchsia-70'
})

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
  return (
    t('enchant-simulator.enchant-step') +
    ' ' +
    (step.value.index + 1).toString()
  )
})

const toggleStepType = () => {
  step.value.type =
    step.value.type === EnchantStepTypes.Normal
      ? EnchantStepTypes.Each
      : EnchantStepTypes.Normal
}
const swapStep = (offset: number) => {
  const index = step.value.index
  step.value.belongEquipment.swapStep(index, index + offset)
}
const insertStepBefore = () => {
  step.value.belongEquipment.insertStepBefore(step.value)
}
</script>
