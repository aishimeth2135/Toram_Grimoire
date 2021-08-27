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
          <!-- <cy-button-border
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
          </cy-button-border> -->
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
    <div class="max-w-full overflow-x-auto px-1">
      <div v-if="currentCalculation" class="min-w-max">
        <DamageCalculationItem
          :calc-struct-item="currentCalcStruct"
          root
        />
      </div>
    </div>
    <div
      v-show="contents.compare"
      class="sticky z-10 mx-3 px-4 bottom-28 border-1 border-light-3 rounded-lg p-3 bg-white overflow-y-auto"
      style="max-height: 40vh;"
    >
      <DamageCalculationCompare
        :main-calculation="currentCalculation"
        :calculations="calculations"
        :calc-struct="currentCalcStruct"
      />
    </div>
    <div
      v-if="contents.resultDetail"
      class="sticky z-10 mx-3 px-4 bottom-28 border-1 border-light-3 rounded-lg p-3 bg-white overflow-y-auto"
      style="max-height: 40vh;"
    >
      <div>
        <div class="inline-flex items-center cursor-pointer">
          <cy-icon-text icon="ant-design:star-outlined">
            {{ $lang('result/expected') }}
          </cy-icon-text>
          <span class="text-light-3 ml-2">{{ expectedResult }}</span>
          <cy-icon-text icon="bx-bx-info-circle" class="ml-3" />
        </div>
      </div>
      <div>
        <cy-icon-text icon="tabler:angle">
          {{ $lang('result/range') }}
        </cy-icon-text>
        <span class="text-light-3 ml-2 mr-4 inline-flex items-center">
          <span>{{ resultWithStability.min }}</span>
          <cy-icon-text icon="mdi:tilde" class="mx-1" />
          <span>{{ resultWithStability.max }}</span>
        </span>
      </div>
      <div>
        <div class="inline-flex items-center cursor-pointer">
          <cy-icon-text icon="ant-design:star-outlined">
            {{ $lang('result/expected with critical') }}
          </cy-icon-text>
          <span class="text-light-3 ml-2">{{ expectedResult }}</span>
          <cy-icon-text icon="bx-bx-info-circle" class="ml-3" />
        </div>
      </div>
    </div>
    <div class="flex ml-auto sticky z-10 px-4 bottom-16 mt-2">
      <cy-button-border
        icon="bx:bx-git-compare"
        :selected="contents.compare"
        @click="toggle('contents/compare')"
      />
      <cy-button-border icon="heroicons-outline:switch-vertical" @click="toggleMode">
        {{ $lang('mode/' + currentMode) }}
      </cy-button-border>
    </div>
    <div class="sticky bottom-4">
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-2 rounded-full flex items-center flex-wrap bg-white justify-end">
        <!-- <cy-icon-text icon="tabler:angle">
          {{ $lang('result/range') }}
        </cy-icon-text>
        <span class="text-light-3 ml-2 mr-4 inline-flex items-center">
          <span>{{ resultWithStability.min }}</span>
          <cy-icon-text icon="mdi:tilde" class="mx-1" />
          <span>{{ resultWithStability.max }}</span>
        </span> -->
        <div class="inline-flex items-center cursor-pointer" @click="toggle('contents/resultDetail')">
          <cy-icon-text icon="ant-design:star-outlined">
            {{ $lang('result/expected') }}
          </cy-icon-text>
          <span class="text-light-3 ml-2">{{ expectedResult }}</span>
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
import { computed, readonly, ref, ComputedRef } from 'vue';
import { mapActions, mapMutations, useStore } from 'vuex';
import init from './init.js';

import ToggleService from '@/setup/ToggleService';
import AutoSave from '@/setup/AutoSave';
import RegisterLang from '@/setup/RegisterLang';
import Notify from '@/setup/Notify';

import { calcStructCritical, calcStructWithoutCritical } from './consts';
import { Calculation } from '@/lib/Calculation/Damage/Calculation';

import vue_DamageCalculationItem from './damage-calculation-item';
import vue_DamageCalculationCompare from './damage-calculation-compare';

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

    const { lang, rootLang } = RegisterLang('Damage Calculation');
    const { notify } = Notify();

    const mode = ref('critical');

    const toggleMode = () => mode.value = mode.value === 'critical' ? 'without_critical' : 'critical';

    /** @type {ComputedRef<Array<Calculation>>} */
    const calculations = computed(() => store.state['damage-calculation'].calculations);

    /** @type {ComputedRef<Calculation>} */
    const currentCalculation = computed(() => store.getters['damage-calculation/currentCalculation']);

    const currentCalcStruct = computed(() => mode.value === 'critical' ? calcStructCritical : calcStructWithoutCritical);

    const expectedResult = computed(() => currentCalculation.value.result(currentCalcStruct.value));

    const resultWithStability = computed(() => {
      const min = currentCalculation.value.result(currentCalcStruct.value, {
        containerResult: {
          'stability': itemContainer => itemContainer.getItemValue('stability'),
        },
      });
      const max = currentCalculation.value.result(currentCalcStruct.value, {
        containerResult: {
          'stability': 100,
        },
      });
      return { min, max };
    });

    const removeCurrentCalculation = () => {
      if (calculations.value.length === 1) {
        notify(lang('tips/At least one build must be kept'));
        return;
      }
      const calculation = currentCalculation.value;
      store.commit('damage-calculation/removeCalculation', calculation);
      notify(lang('tips/Successfully removed build', [calculation.name]), {
        buttons: [{
          text: rootLang('global/recovery'),
          removeMessageAfterClick: true,
          click: () => store.commit('damage-calculation/appendCalculation', calculation),
        }],
      });
    };

    const copyCurrentCalculation = () => {
      const calculation = currentCalculation.value.copy();
      store.commit('damage-calculation/appendCalculation', calculation);
    };

    const calculationItems = computed(() => {
      return calculations.value.map((calc, index) => ({
        index,
        origin: calc,
      }));
    });

    const { contents, toggle } = ToggleService({
      contents: ['mainMenu', 'compare', 'resultDetail'],
    });

    return {
      currentMode: readonly(mode),

      // computed
      calculations,
      currentCalculation,
      currentCalcStruct,
      expectedResult,
      resultWithStability,
      calculationItems,

      // methods
      toggleMode,
      copyCurrentCalculation,
      removeCurrentCalculation,

      // other
      contents,
      toggle,
    };
  },
  methods: {
    ...mapMutations('damage-calculation', ['selectCalculation']),
    ...mapMutations('damage-calculation/calculation', ['setCalculationName']),
    ...mapActions('damage-calculation', [
      'createCalculation',
      'copyCurrentCalculation',
    ]),
  },
};
</script>
