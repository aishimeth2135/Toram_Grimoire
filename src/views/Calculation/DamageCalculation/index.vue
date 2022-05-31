<template>
  <AppLayoutMain v-if="currentCalculation" class="flex flex-col">
    <div class="max-w-full px-1 py-4 overflow-x-auto scrollbar-hide">
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
        <DamageCalculationItem
          :calc-struct-item="calcMode.calcStruct"
          root
        />
        <cy-hr />
        <DamageCalculationItem
          v-for="outsideItem in calcMode.outsideItems"
          :key='outsideItem'
          :calc-struct-item="outsideItem"
          root
        />
      </div>
    </div>
    <AppLayoutBottom>
      <template #default>
        <div class="flex items-center justify-end py-0.5 px-3 cursor-pointer" @click="toggle('contents/resultDetail', null, false)">
          <cy-icon-text
            :icon="contents.resultDetail ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
            class="mr-auto"
          />
          <DamageCalculationResultItem :result-item="resultMode" />
        </div>
      </template>
      <template #main-content>
        <AppLayoutBottomContent v-if="contents.resultDetail" class="py-3 px-4">
          <div>
            <cy-icon-text icon="ant-design:star-outlined" small text-color="purple">
              {{ t('damage-calculation.result.title') }}
            </cy-icon-text>
          </div>
          <template v-for="modeItem in resultModeList" :key="modeItem.id">
            <div
              class="flex items-center cursor-pointer min-w-max pr-3"
              @click="selectResultMode(modeItem.id)"
            >
              <cy-button-check :selected="modeItem === resultMode" />
              <DamageCalculationResultItem :result-item="modeItem" />
            </div>
            <div>
              <cy-icon-text
                icon="bx-bx-info-circle"
                small
                text-color="light-2"
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
          :selected="contents.compare"
          main-color="blue-green"
          @click="toggle('contents/compare', null, false)"
        />
        <cy-button-circle
          icon="ic:outline-calculate"
          :selected="contents.calcModeDetail"
          main-color="orange"
          @click="toggle('contents/calcModeDetail', null, false)"
        />
        <cy-button-circle
          icon="ant-design:build-outlined"
          :selected="contents.mainMenu"
          main-color="light-3"
          @click="toggle('contents/mainMenu', null,  false)"
        />
      </template>
      <template #side-contents>
        <cy-transition type="fade" mode="out-in">
          <AppLayoutBottomContent v-if="contents.mainMenu" class="p-3">
            <div class="flex items-center">
              <cy-title-input
                v-model:value="currentCalculation.name"
                icon="ant-design:build-outlined"
                class="w-full"
              />
              <cy-options
                :value="store.currentCalculation"
                :options="calculationItems.map(item => ({ id: item.index, value: item.origin }))"
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
            <div class="flex items-center flex-wrap">
              <div class="mx-2">
                <cy-button-action
                  icon="bx-bx-copy"
                  @click="copyCurrentCalculation"
                >
                  {{ t('global.copy') }}
                </cy-button-action>
                <cy-button-action
                  icon="mdi-export"
                  color="blue-green"
                  @click="exportBuild"
                >
                  {{ t('global.export') }}
                </cy-button-action>
                <cy-button-action
                  icon="mdi-import"
                  color="blue-green"
                  @click="importBuild"
                >
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
          <AppLayoutBottomContent v-else-if="contents.compare" class="px-4 py-3">
            <div>
              <cy-icon-text icon="bx:bx-git-compare" small text-color="purple">
                {{ t('damage-calculation.compare.title') }}
              </cy-icon-text>
            </div>
            <div class="mb-2">
              <cy-icon-text icon="bx-bx-info-circle" small text-color="light-3" align-v="center" class="ml-2">
                {{ t('damage-calculation.compare.caption') }}
              </cy-icon-text>
            </div>
            <DamageCalculationCompare />
          </AppLayoutBottomContent>
          <AppLayoutBottomContent v-else-if="contents.calcModeDetail" class="py-3 px-4">
            <div>
              <cy-icon-text icon="ant-design:star-outlined" small text-color="purple">
                {{ t('damage-calculation.calc-mode.title') }}
              </cy-icon-text>
            </div>
            <div>
              <cy-icon-text icon="bx-bx-info-circle" small text-color="light-3" align-v="center" class="ml-2">
                {{ t('damage-calculation.calc-mode.caption') }}
              </cy-icon-text>
            </div>
            <template v-for="modeItem in calcModeList" :key="modeItem.id">
              <div
                class="flex items-center cursor-pointer min-w-max pr-3"
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
                  text-color="light-2"
                  class="ml-6"
                  align-v="start"
                >
                  {{ t('damage-calculation.calc-mode.modes-caption.' + modeItem.id) }}
                </cy-icon-text>
              </div>
            </template>
          </AppLayoutBottomContent>
        </cy-transition>
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

<script lang="ts">
export default {
  name: 'DamageCalculation',
}
</script>

<script lang="ts" setup>
import { computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDamageCalculationStore } from '@/stores/views/damage-calculation'
import { useDatasStore } from '@/stores/app/datas'

import { CalculationSaveData } from '@/lib/Calculation/Damage/Calculation'

import AutoSave from '@/setup/AutoSave'
import ExportBuild from '@/setup/ExportBuild'
import ToggleService from '@/setup/ToggleService'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'

import DamageCalculationCompare from './damage-calculation-compare.vue'
import DamageCalculationItem from './damage-calculation-item.vue'
import DamageCalculationResultItem from './damage-calculation-result-item.vue'

import { setupCalcMode, setupCalculationStore, setupResultMode, setupCalculationCalcOptions } from './setup'
import { DamageCalculationRootInjectionKey } from './injection-keys'

const store = useDamageCalculationStore()
const datasStore = useDatasStore()

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.load(),
})

const {
  calcModeList,
  calcMode,
  selectCalcMode,
} = setupCalcMode()

const {
  // calculations,
  currentCalculation,
  calculationItems,

  removeCurrentCalculation,
  copyCurrentCalculation,
} = setupCalculationStore()

const {
  resultMode,
  resultModeList,
  selectResultMode,
} = setupResultMode(currentCalculation)

const {
  calculationContainerOptions,
} = setupCalculationCalcOptions(currentCalculation)

const { exportBuild, importBuild } = ExportBuild({
  save: (handleSave) => {
    const fileName = currentCalculation.value.name + '.txt'
    const data = JSON.stringify(currentCalculation.value.save())
    handleSave(fileName, data)
  },
  loaded: res => {
    const saveData = JSON.parse(res) as CalculationSaveData
    const calculationBase = datasStore.DamageCalculation!.calculationBase
    const calculation = calculationBase.createCalculation()
    calculation.load(saveData)
    store.appendCalculation(calculation)
  },
})

const { contents, toggle } = ToggleService({
  contents: ['compare', 'resultDetail', 'calcModeDetail', 'mainMenu'] as const,
})

const { t } = useI18n()

provide(DamageCalculationRootInjectionKey, {
  currentExpectedResult: computed(() => {
    const resultItem = resultModeList.value.find(item => item.id === 'expected')!.value
    return resultItem as number
  }),
  currentCalcMode: calcMode,
})
</script>
