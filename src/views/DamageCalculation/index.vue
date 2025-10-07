<template>
  <AppLayoutMain v-if="currentCalculation">
    <div class="scrollbar-hide max-w-full overflow-x-auto px-1 py-4">
      <div v-if="currentCalculation" class="min-w-max">
        <div
          v-for="containerOption in calculationContainerOptions"
          :key="containerOption.container.base.id"
        >
          <cy-button-check
            v-for="item in containerOption.containerItems"
            :key="item.base.id"
            :selected="containerOption.container.currentItem === item"
            @click="containerOption.container.selectItem(item.base.id)"
          >
            {{ t('damage-calculation.item-base-titles.' + item.base.id) }}
          </cy-button-check>
        </div>
        <cy-hr />
        <DamageCalculationItem :calc-struct-item="calcMode.calcStruct" root />
        <cy-hr />
        <DamageCalculationItem
          v-for="outsideItem in calcMode.outsideItems"
          :key="outsideItem"
          :calc-struct-item="outsideItem"
          root
        />
      </div>
    </div>
    <AppLayoutBottom>
      <template #default>
        <div
          class="flex cursor-pointer items-center justify-end px-3 py-0.5"
          @click="toggleMainContents(false).and(toggleResultDetailVisible)"
        >
          <cy-icon
            :icon="
              resultDetailVisible
                ? 'akar-icons:circle-chevron-down'
                : 'akar-icons:circle-chevron-up'
            "
            class="mr-auto"
          />
          <DamageCalculationResultItem :result-item="resultMode" />
        </div>
      </template>
      <template #main-content>
        <AppLayoutBottomContent v-if="resultDetailVisible" class="px-4 py-3">
          <div>
            <cy-icon-text icon="ant-design:star-outlined" small text-color="fuchsia-60">
              {{ t('damage-calculation.result.title') }}
            </cy-icon-text>
          </div>
          <template v-for="modeItem in resultModeList" :key="modeItem.id">
            <div
              class="flex min-w-max cursor-pointer items-center pr-3"
              @click="selectResultMode(modeItem.id)"
            >
              <cy-button-check :selected="modeItem === resultMode" />
              <DamageCalculationResultItem :result-item="modeItem" />
            </div>
            <div>
              <cy-icon-text
                icon="bx-bx-info-circle"
                small
                text-color="primary-30"
                class="ml-6"
                align-v="start"
              >
                {{ t('damage-calculation.result.modes-caption.' + modeItem.id) }}
              </cy-icon-text>
            </div>
          </template>
        </AppLayoutBottomContent>
      </template>
      <template #side-buttons>
        <cy-button-circle
          icon="bx:bx-git-compare"
          :selected="compareVisible"
          color="cyan"
          float
          toggle
          @click="toggleMainContents(false).and(toggleCompareVisible)"
        />
        <cy-button-circle
          icon="ic:outline-calculate"
          :selected="calcModeDetailVisible"
          color="orange"
          float
          toggle
          @click="toggleMainContents(false).and(toggleCalcModeDetailVisible)"
        />
        <cy-button-circle
          icon="ant-design:build-outlined"
          :selected="mainMenuVisible"
          color="bright"
          float
          toggle
          @click="toggleMainContents(false).and(toggleMainMenuVisible)"
        />
      </template>
      <template #side-contents>
        <AppLayoutBottomContent v-if="mainMenuVisible" class="p-3">
          <div class="flex items-center">
            <cy-title-input
              v-model:value="currentCalculation.name"
              icon="ant-design:build-outlined"
              class="w-full"
            />
            <cy-options
              :value="store.currentCalculation"
              :options="
                calculationItems.map(item => ({
                  id: item.index,
                  value: item.origin,
                }))
              "
              addable
              @update:value="store.selectCalculation($event)"
              @add-item="store.createCalculation()"
            >
              <template #title>
                <cy-button-circle icon="ant-design:build-outlined" small />
              </template>
              <template #item="{ value }">
                <cy-icon-text icon="ant-design:build-outlined">
                  {{ value.name }}
                </cy-icon-text>
              </template>
            </cy-options>
          </div>
          <div class="flex flex-wrap items-center">
            <div class="mx-2">
              <cy-button-action icon="bx-bx-copy" @click="copyCurrentCalculation">
                {{ t('global.copy') }}
              </cy-button-action>
              <cy-button-action icon="mdi-export" color="cyan" @click="exportBuild">
                {{ t('global.export') }}
              </cy-button-action>
              <cy-button-action icon="mdi-import" color="cyan" @click="importBuild">
                {{ t('global.import') }}
              </cy-button-action>
              <cy-button-action
                icon="ic-baseline-delete-outline"
                color="secondary"
                @click="removeCurrentCalculation"
              >
                {{ t('global.delete') }}
              </cy-button-action>
            </div>
          </div>
        </AppLayoutBottomContent>
        <AppLayoutBottomContent v-else-if="compareVisible" class="px-4 py-3">
          <div>
            <cy-icon-text icon="bx:bx-git-compare" small text-color="fuchsia-60">
              {{ t('damage-calculation.compare.title') }}
            </cy-icon-text>
          </div>
          <div class="mb-2">
            <cy-icon-text
              icon="bx-bx-info-circle"
              small
              text-color="primary-50"
              align-v="center"
              class="ml-2"
            >
              {{ t('damage-calculation.compare.caption') }}
            </cy-icon-text>
          </div>
          <DamageCalculationCompare />
        </AppLayoutBottomContent>
        <AppLayoutBottomContent v-else-if="calcModeDetailVisible" class="px-4 py-3">
          <div>
            <cy-icon-text icon="ant-design:star-outlined" small text-color="fuchsia-60">
              {{ t('damage-calculation.calc-mode.title') }}
            </cy-icon-text>
          </div>
          <div>
            <cy-icon-text
              icon="bx-bx-info-circle"
              small
              text-color="primary-50"
              align-v="center"
              class="ml-2"
            >
              {{ t('damage-calculation.calc-mode.caption') }}
            </cy-icon-text>
          </div>
          <template v-for="modeItem in calcModeList" :key="modeItem.id">
            <div
              class="flex min-w-max cursor-pointer items-center pr-3"
              @click="selectCalcMode(modeItem.id)"
            >
              <cy-button-check :selected="modeItem === calcMode">
                {{ t('damage-calculation.calc-mode.modes.' + modeItem.id) }}
              </cy-button-check>
            </div>
            <div>
              <cy-icon-text
                icon="bx-bx-info-circle"
                small
                text-color="primary-30"
                class="ml-6"
                align-v="start"
              >
                {{ t('damage-calculation.calc-mode.modes-caption.' + modeItem.id) }}
              </cy-icon-text>
            </div>
          </template>
        </AppLayoutBottomContent>
      </template>
    </AppLayoutBottom>
  </AppLayoutMain>
  <AppLayoutMain v-else>
    <cy-default-tips icon="mdi-ghost">
      <cy-button-action @click="store.selectCalculation(0)">
        {{ t('global.recovery') }}
      </cy-button-action>
    </cy-default-tips>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { computed, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDamageCalculationStore } from '@/stores/views/damage-calculation'

import Grimoire from '@/shared/Grimoire'
import AutoSave from '@/shared/setup/AutoSave'
import ExportBuild from '@/shared/setup/ExportBuild'
import { useToggle, useToggleGroup } from '@/shared/setup/State'

import { type CalculationSaveData } from '@/lib/Damage/DamageCalculation'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import DamageCalculationCompare from './damage-calculation-compare.vue'
import DamageCalculationItem from './damage-calculation-item.vue'
import DamageCalculationResultItem from './damage-calculation-result-item.vue'

import { DamageCalculationRootInjectionKey } from './injection-keys'
import {
  setupCalcMode,
  setupCalculationCalcOptions,
  setupCalculationStore,
  setupResultMode,
} from './setup'

defineOptions({
  name: 'DamageCalculation',
})

const store = useDamageCalculationStore()

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.load(),
})

const { calcModeList, calcMode, selectCalcMode } = setupCalcMode()

const {
  // calculations,
  currentCalculation,
  calculationItems,

  removeCurrentCalculation,
  copyCurrentCalculation,
} = setupCalculationStore()

const { resultMode, resultModeList, selectResultMode } = setupResultMode(currentCalculation)

const { calculationContainerOptions } = setupCalculationCalcOptions(currentCalculation)

const { exportBuild, importBuild } = ExportBuild({
  save: handleSave => {
    const fileName = currentCalculation.value.name + '.txt'
    const data = JSON.stringify(currentCalculation.value.save())
    handleSave(fileName, data)
  },
  loaded: res => {
    const saveData = JSON.parse(res) as CalculationSaveData
    const calculationBase = Grimoire.DamageCalculation.calculationBase
    const calculation = calculationBase.createCalculation()
    calculation.load(saveData)
    store.appendCalculation(calculation)
  },
})

const compareVisible = ref(false)
const toggleCompareVisible = useToggle(compareVisible)
const resultDetailVisible = ref(false)
const toggleResultDetailVisible = useToggle(resultDetailVisible)
const calcModeDetailVisible = ref(false)
const toggleCalcModeDetailVisible = useToggle(calcModeDetailVisible)
const mainMenuVisible = ref(false)
const toggleMainMenuVisible = useToggle(mainMenuVisible)

const toggleMainContents = useToggleGroup([
  toggleCompareVisible,
  toggleResultDetailVisible,
  toggleCalcModeDetailVisible,
  toggleMainMenuVisible,
])

const { t } = useI18n()

provide(DamageCalculationRootInjectionKey, {
  currentExpectedResult: computed(() => {
    const resultItem = resultModeList.value.find(item => item.id === 'expected')!.value
    return resultItem as number
  }),
  currentCalcMode: calcMode,
})
</script>
