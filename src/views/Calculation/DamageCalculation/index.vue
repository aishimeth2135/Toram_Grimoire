<template>
  <section v-if="currentCalculation" class="flex flex-col">
    <cy-top-header class="cursor-pointer" @click="toggle('contents/mainMenu')">
      <cy-icon-text icon="ant-design:build-outlined">
        {{ currentCalculation.name }}
      </cy-icon-text>
      <cy-button-icon
        class="ml-auto"
        :icon="contents.mainMenu ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
        :selected="contents.mainMenu"
      />
    </cy-top-header>
    <cy-top-header-menu :visible="contents.mainMenu">
      <div class="flex items-center">
        <cy-title-input
          :value="currentCalculation.name"
          icon="ant-design:build-outlined"
          class="w-full"
          @update:value="currentCalculation.name = $event"
        />
        <cy-options inline>
          <template #title>
            <cy-button-border icon="ant-design:build-outlined" />
          </template>
          <template #options>
            <cy-list-item
              v-for="item in calculationItems"
              :key="item.index"
              @click="store.selectCalculation(item.index)"
            >
              <cy-icon-text icon="ant-design:build-outlined">
                {{ item.origin.name }}
              </cy-icon-text>
            </cy-list-item>
            <cy-list-item @click="store.createCalculation()">
              <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
                {{ t('damage-calculation.create-build') }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-options>
      </div>
      <div class="flex items-center flex-wrap">
        <div class="mx-2">
          <cy-button-border
            icon="bx-bx-copy"
            @click="copyCurrentCalculation"
          >
            {{ t('global.copy') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-export"
            main-color="blue-green"
            @click="exportBuild"
          >
            {{ t('global.export') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-import"
            main-color="blue-green"
            @click="importBuild"
          >
            {{ t('global.import') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeCurrentCalculation"
          >
            {{ t('global.delete') }}
          </cy-button-border>
        </div>
      </div>
    </cy-top-header-menu>
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
    <cy-transition type="fade">
      <div
        v-show="bottomSub.compare"
        class="sticky z-10 mx-3 px-4 bottom-24 border-1 border-light-3 rounded-lg p-3 bg-white overflow-y-auto"
        style="max-height: 40vh;"
      >
        <div>
          <cy-icon-text icon="bx:bx-git-compare" size="small" text-color="purple">
            {{ t('damage-calculation.compare.title') }}
          </cy-icon-text>
        </div>
        <div class="mb-2">
          <cy-icon-text icon="bx-bx-info-circle" size="small" text-color="light-3" align-v="center" class="ml-2">
            {{ t('damage-calculation.compare.caption') }}
          </cy-icon-text>
        </div>
        <DamageCalculationCompare />
      </div>
    </cy-transition>
    <cy-transition type="fade">
      <div
        v-if="bottomSub.calcModeDetail"
        class="sticky z-10 mx-3 py-3 px-4 bottom-24 border-1 border-light-3 rounded-lg bg-white overflow-y-auto"
        style="max-height: 40vh;"
      >
        <div>
          <cy-icon-text icon="ant-design:star-outlined" size="small" text-color="purple">
            {{ t('damage-calculation.calc-mode.title') }}
          </cy-icon-text>
        </div>
        <div>
          <cy-icon-text icon="bx-bx-info-circle" size="small" text-color="light-3" align-v="center" class="ml-2">
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
              size="small"
              text-color="light-2"
              class="ml-6"
              align-v="start"
            >
              {{ t('damage-calculation.calc-mode.modes-caption.' + modeItem.id) }}
            </cy-icon-text>
          </div>
        </template>
      </div>
    </cy-transition>
    <cy-transition type="fade">
      <div
        v-if="bottomSub.resultDetail"
        class="sticky z-10 mx-3 py-3 px-4 bottom-24 border-1 border-light-3 rounded-lg bg-white overflow-y-auto"
        style="max-height: 40vh;"
      >
        <div>
          <cy-icon-text icon="ant-design:star-outlined" size="small" text-color="purple">
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
              size="small"
              text-color="light-2"
              class="ml-6"
              align-v="start"
            >
              {{ t('damage-calculation.result.modes-caption.' + modeItem.id) }}
            </cy-icon-text>
          </div>
        </template>
      </div>
    </cy-transition>
    <div class="flex ml-auto sticky z-10 px-4 bottom-14 mt-2">
      <cy-button-border
        icon="bx:bx-git-compare"
        :selected="bottomSub.compare"
        @click="toggle('bottomSub/compare', null, false)"
      />
      <cy-button-border
        icon="ic:outline-calculate"
        :selected="bottomSub.calcModeDetail"
        @click="toggle('bottomSub/calcModeDetail', null, false)"
      />
    </div>
    <div class="sticky bottom-2 overflow-x-auto scrollbar-hide">
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-2 rounded-full flex items-center flex-wrap bg-white justify-end min-w-max">
        <DamageCalculationResultItem
          :result-item="resultMode"
          @click="toggle('bottomSub/resultDetail', null, false)"
        />
      </div>
    </div>
  </section>
  <cy-default-tips v-else icon="mdi-ghost">
    <cy-button-border @click="store.selectCalculation(0)">
      {{ t('global.recovery') }}
    </cy-button-border>
  </cy-default-tips>
</template>

<script lang="ts">
export default {
  name: 'DamageCalculation',
};
</script>

<script lang="ts" setup>
import { computed, provide } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDamageCalculationStore } from '@/stores/views/damage-calculation';
import { useDatasStore } from '@/stores/app/datas';

import { CalculationSaveData } from '@/lib/Calculation/Damage/Calculation';

import AutoSave from '@/setup/AutoSave';
import ExportBuild from '@/setup/ExportBuild';
import ToggleService from '@/setup/ToggleService';

import DamageCalculationCompare from './damage-calculation-compare.vue';
import DamageCalculationItem from './damage-calculation-item.vue';
import DamageCalculationResultItem from './damage-calculation-result-item.vue';

import { setupCalcMode, setupCalculationStore, setupResultMode, setupCalculationCalcOptions, ResultModeItem, ResultModeIdExpected } from './setup';
import { DamageCalculationRootInjectionKey } from './injection-keys';

const store = useDamageCalculationStore();
const datasStore = useDatasStore();

AutoSave({
  save: () => store.save(),
  loadFirst: () => store.load(),
});

const {
  calcModeList,
  calcMode,
  selectCalcMode,
} = setupCalcMode();

const {
  // calculations,
  currentCalculation,
  calculationItems,

  removeCurrentCalculation,
  copyCurrentCalculation,
} = setupCalculationStore();

const {
  resultMode,
  resultModeList,
  selectResultMode,
} = setupResultMode(currentCalculation);

const {
  calculationContainerOptions,
} = setupCalculationCalcOptions(currentCalculation);

const { exportBuild, importBuild } = ExportBuild({
  save: (handleSave) => {
    const fileName = currentCalculation.value.name + '.txt';
    const data = JSON.stringify(currentCalculation.value.save());
    handleSave(fileName, data);
  },
  loaded: res => {
    const saveData = JSON.parse(res) as CalculationSaveData;
    const calculationBase = datasStore.DamageCalculation!.calculationBase;
    const calculation = calculationBase.createCalculation();
    calculation.load(saveData);
    store.appendCalculation(calculation);
  },
});

const { contents, bottomSub, toggle } = ToggleService({
  contents: ['mainMenu'] as const,
  bottomSub: ['compare', 'resultDetail', 'calcModeDetail'] as const,
});

const { t } = useI18n();

provide(DamageCalculationRootInjectionKey, computed(() => (resultModeList.value.find(item => item.id === 'expected') as ResultModeItem<ResultModeIdExpected>).value));
</script>
