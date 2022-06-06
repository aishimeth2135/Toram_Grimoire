<!-- this component is splitted to handle EnchantStep -->
<template>
  <div
    class="px-2 pt-1 flex flex-col h-full bg-white border"
    style="min-height: 12.5rem"
    :class="{ [mainBorderColor]: true, 'opacity-50': step.hidden }"
  >
    <div class="border-b pl-2 flex items-center py-0.5" :class="[mainBorderColor]">
      <cy-icon-text
        icon="bx-bxs-book-content"
        small
        :text-color="mainTextColor"
        :icon-color="mainTextColor"
      >
        {{ stepTitle }}
      </cy-icon-text>
      <div class="ml-auto inline-flex items-center mr-1">
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
              <cy-list-item
                v-if="step.index !== 0"
                @click="swapStep(-1)"
              >
                <cy-icon-text icon="eva-arrow-ios-upward-fill">
                  {{ t('enchant-simulator.step.step-move-up') }}
                </cy-icon-text>
              </cy-list-item>
              <cy-list-item
                v-if="!step.isLastStep"
                @click="swapStep(1)"
              >
                <cy-icon-text icon="eva-arrow-ios-downward-outline">
                  {{ t('enchant-simulator.step.step-move-down') }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </template>
        </cy-popover>
        <cy-button-icon
          :icon="step.hidden ? 'mdi-checkbox-blank-off-outline' : 'mdi-checkbox-blank-outline'"
          class="p-0"
          :icon-color="step.hidden ? 'red' : 'red-light'"
          @click="step.hidden = !step.hidden/* eslint-disable-line vue/no-mutating-props */"
        />
        <cy-button-icon
          icon="jam-close-circle"
          class="p-0"
          icon-color="gray"
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
          :class="idx !== 0 ? 'border-t border-light' : ''"
        />
      </template>
      <div v-else-if="step.index === 0" class="pt-3 pb-2 px-2">
        <div>
          <cy-icon-text small text-color="purple">
            {{ t('enchant-simulator.step.button-caption-title') }}
          </cy-icon-text>
        </div>
        <div class="pl-2">
          <div>
            <cy-icon-text
              small
              icon="ic-round-add-circle-outline"
              icon-color="water-blue"
            >
              {{ t('enchant-simulator.step.select-one-stat-item') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              small
              icon="ic-round-add-circle-outline"
              icon-color="red"
            >
              {{ t('enchant-simulator.step.select-multiple-stat-items') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              small
              icon="ic-outline-near-me"
              icon-color="blue-green"
            >
              {{ t('enchant-simulator.step.step-type-each') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              small
              icon="ant-design:star-outlined"
              icon-color="orange"
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
    <div class="border-t border-purple mt-auto pt-0.5">
      <cy-transition>
        <div v-if="isTypeEach" class="border-b border-light-2 py-0.5">
          <cy-input-counter
            v-model:value="step.step/* eslint-disable-line vue/no-mutating-props */"
            inline
            main-color="blue-green"
          >
            <template #title>
              <cy-icon-text icon="ic-outline-near-me" icon-color="blue-green">
                {{ t('enchant-simulator.step.step-type-each-title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </cy-transition>
      <div class="flex items-center py-0.5">
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          icon-color="water-blue"
          @click="openSelectItem('step', step, true)"
        />
        <cy-button-icon
          icon="ic-round-add-circle-outline"
          icon-color="red"
          @click="openSelectItem('step', step)"
        />
        <cy-button-icon
          :icon="typeIcon"
          :icon-color="isTypeEach ? 'blue-green' : 'blue-green-light'"
          icon-color-hover="blue-green"
          @click="toggleStepType"
        />
        <cy-button-icon
          v-if="step.belongEquipment.stats(step.index - 1).length >= 6"
          icon="ant-design:star-outlined"
          icon-color="orange"
          @click="step.autoFill()"
        />
        <cy-icon-text icon="mdi-creation" class="ml-auto mr-2" text-color="purple">
          {{ step.remainingPotential }}
        </cy-icon-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'EnchantStep',
}
</script>

<script lang="ts" setup>
import { computed, inject, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { EnchantStep } from '@/lib/Enchant/Enchant'
import { EnchantStepTypes } from '@/lib/Enchant/Enchant/enums'

import EnchantStepStatView from './enchant-step-stat.vue'

import { EnchantSimulatorInjectionKey } from '../injection-keys'

interface Props {
  step: EnchantStep;
}

const props = defineProps<Props>()

const { step } = toRefs(props)
const { t } = useI18n()

const { openSelectItem } = inject(EnchantSimulatorInjectionKey)!

const typeIcon = computed(() => step.value.type === EnchantStepTypes.Normal ? 'ic-outline-near-me-disabled' : 'ic-outline-near-me')

const isTypeEach = computed(() => step.value.type === EnchantStepTypes.Each)

const mainTextColor = computed(() => {
  if (step.value.isLastStep) {
    return 'water-blue'
  }
  if (step.value.afterLastStep) {
    return 'gray'
  }
  return 'purple'
})

const mainBorderColor = computed(() => {
  if (step.value.isLastStep) {
    return 'border-water-blue'
  }
  if (step.value.afterLastStep) {
    return 'border-gray'
  }
  return 'border-purple'
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
  step.value.type = step.value.type === EnchantStepTypes.Normal ? EnchantStepTypes.Each : EnchantStepTypes.Normal
}
const swapStep = (offset: number) => {
  const index = step.value.index
  step.value.belongEquipment.swapStep(index, index + offset)
}
const insertStepBefore = () => {
  step.value.belongEquipment.insertStepBefore(step.value)
}
</script>
