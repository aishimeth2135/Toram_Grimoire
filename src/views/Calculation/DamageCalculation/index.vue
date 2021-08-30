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
          @update:value="setCalculationName({ calculation: currentCalculation, name: $event })"
        />
        <cy-options inline>
          <template #title>
            <cy-button-border icon="ant-design:build-outlined" />
          </template>
          <template #options>
            <cy-list-item
              v-for="item in calculationItems"
              :key="item.index"
              @click="selectCalculation(item.index)"
            >
              <cy-icon-text icon="ant-design:build-outlined">
                {{ item.origin.name }}
              </cy-icon-text>
            </cy-list-item>
            <cy-list-item @click="createCalculation">
              <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
                {{ $lang('create build') }}
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
            {{ $rootLang('global/copy') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-export"
            main-color="blue-green"
            @click="exportBuild"
          >
            {{ $rootLang('global/export') }}
          </cy-button-border>
          <cy-button-border
            icon="mdi-import"
            main-color="blue-green"
            @click="importBuild"
          >
            {{ $rootLang('global/import') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeCurrentCalculation"
          >
            {{ $rootLang('global/delete') }}
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
            @click="setContainerCurrentItemId({
              container: containerOption.container,
              value: item.base.id,
            })"
          >
            {{ $lang('item base: title/' + item.base.id) }}
          </cy-button-check>
        </div>
        <cy-hr />
        <DamageCalculationItem
          :calc-struct-item="currentCalcStruct"
          root
        />
        <cy-hr />
        <DamageCalculationItem calc-struct-item="critical_rate" root />
      </div>
    </div>
    <cy-transition type="fade">
      <div
        v-show="bottomSub.compare"
        class="sticky z-10 mx-3 px-4 bottom-28 border-1 border-light-3 rounded-lg p-3 bg-white overflow-y-auto"
        style="max-height: 40vh;"
      >
        <DamageCalculationCompare />
      </div>
    </cy-transition>
    <cy-transition type="fade">
      <div
        v-if="bottomSub.resultDetail"
        class="sticky z-10 mx-3 py-3 px-4 bottom-28 border-1 border-light-3 rounded-lg bg-white overflow-y-auto"
        style="max-height: 40vh;"
      >
        <template v-for="modeItem in resultModeList" :key="modeItem.id">
          <div
            class="flex items-center cursor-pointer min-w-max pr-3"
            @click="selectResultMode(modeItem.id)"
          >
            <cy-button-check :selected="modeItem === resultMode" />
            <div class="inline-flex items-center cursor-pointer">
              <cy-icon-text :icon="modeItem.icon">
                {{ $lang('result/modes/' + modeItem.id) }}
              </cy-icon-text>
              <span
                v-if="modeItem.id === 'range'"
                class="text-light-3 inline-flex items-center ml-2"
              >
                <span>{{ modeItem.value.min }}</span>
                <cy-icon-text icon="mdi:tilde" class="mx-1" />
                <span>{{ modeItem.value.max }}</span>
              </span>
              <span v-else class="text-light-3 ml-2">{{ modeItem.value }}</span>
            </div>
          </div>
          <div>
            <cy-icon-text
              icon="bx-bx-info-circle"
              size="small"
              text-color="light-2"
              class="ml-6"
              align-v="start"
            >
              {{ $lang('result/caption/' + modeItem.id) }}
            </cy-icon-text>
          </div>
        </template>
      </div>
    </cy-transition>
    <div class="flex ml-auto sticky z-10 px-4 bottom-16 mt-2">
      <cy-button-border
        icon="bx:bx-git-compare"
        :selected="bottomSub.compare"
        @click="toggle('bottomSub/compare', null, false)"
      />
      <cy-button-border icon="heroicons-outline:switch-vertical" @click="toggleCalcMode">
        {{ $lang('mode/' + calcMode) }}
      </cy-button-border>
    </div>
    <div class="sticky bottom-4 overflow-x-auto scrollbar-hide">
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-2 rounded-full flex items-center flex-wrap bg-white justify-end min-w-max">
        <div
          class="inline-flex items-center cursor-pointer"
          @click="toggle('bottomSub/resultDetail', null, false)"
        >
          <cy-icon-text :icon="resultMode.icon">
            {{ $lang('result/modes/' + resultMode.id) }}
          </cy-icon-text>
          <span
            v-if="resultMode.id === 'range'"
            class="text-light-3 inline-flex items-center ml-2"
          >
            <span>{{ resultMode.value.min }}</span>
            <cy-icon-text icon="mdi:tilde" class="mx-1" />
            <span>{{ resultMode.value.max }}</span>
          </span>
          <span v-else class="text-light-3 ml-2">{{ resultMode.value }}</span>
          <cy-icon-text icon="bx-bx-info-circle" class="ml-3" />
        </div>
      </div>
    </div>
  </section>
  <cy-default-tips v-else icon="mdi-ghost">
    <cy-button-border @click="selectCalculation(0)">
      {{ $rootLang('global/recovery') }}
    </cy-button-border>
  </cy-default-tips>
</template>

<script>
import { mapActions, mapMutations, useStore } from 'vuex';
import init from './init.js';

import ToggleService from '@/setup/ToggleService';
import AutoSave from '@/setup/AutoSave';
import ExportBuild from '@/setup/ExportBuild';
import { setupCalcMode, setupCalculationStore, setupResultMode, setupCalculationCalcOptions } from './setup';

import vue_DamageCalculationItem from './damage-calculation-item';
import vue_DamageCalculationCompare from './damage-calculation-compare';
import { computed, provide } from '@vue/runtime-core';

export default {
  name: 'DamageCalculation',
  RegisterLang: 'Damage Calculation',
  components: {
    DamageCalculationItem: vue_DamageCalculationItem,
    DamageCalculationCompare: vue_DamageCalculationCompare,
  },
  setup() {
    init();

    const store = useStore();

    AutoSave({
      save: () => store.dispatch('damage-calculation/save'),
      loadFirst: () => store.dispatch('damage-calculation/load'),
    });

    const {
      calcMode,
      currentCalcStruct,
      toggleCalcMode,
    } = setupCalcMode();

    const {
      calculations,
      currentCalculation,
      calculationItems,

      removeCurrentCalculation,
      copyCurrentCalculation,
    } = setupCalculationStore();

    const {
      resultMode,
      resultModeList,
      selectResultMode,
    } = setupResultMode(currentCalculation, currentCalcStruct);

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
        res = JSON.parse(res);
        const calculationBase = store.state.datas.DamageCalculation.calculationBase;
        const calculation = calculationBase.createCalculation();
        calculation.load(res);
        store.commit('damage-calculation/appendCalculation', calculation);
      },
    });

    const { contents, bottomSub, toggle } = ToggleService({
      contents: ['mainMenu'],
      bottomSub: ['compare', 'resultDetail'],
    });

    provide('currentCalculationExpectedResult', computed(() => resultModeList.value.find(item => item.id === 'expected').value));

    return {
      calcMode,

      // computed
      calculations,
      currentCalculation,
      currentCalcStruct,
      calculationItems,
      resultModeList,
      resultMode,
      calculationContainerOptions,

      // methods
      toggleCalcMode,
      copyCurrentCalculation,
      removeCurrentCalculation,
      selectResultMode,
      exportBuild,
      importBuild,

      // other
      bottomSub,
      contents,
      toggle,
    };
  },
  methods: {
    ...mapMutations('damage-calculation', ['selectCalculation']),
    ...mapMutations('damage-calculation/container', ['setContainerCurrentItemId']),
    ...mapMutations('damage-calculation/calculation', ['setCalculationName']),
    ...mapActions('damage-calculation', ['createCalculation']),
  },
};
</script>
