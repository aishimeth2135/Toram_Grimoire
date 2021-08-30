<template>
  <div class="w-full">
    <div>
      <cy-button-border icon="bx:bx-git-compare" @click="toggle('contents/selectCalculation', true)">
        {{ $lang('compare/select build') }}
      </cy-button-border>
    </div>
    <div class="pt-4 space-y-2">
      <DamageCalculationCompareItem
        v-for="item in comparedCalculationItems"
        :key="item.index"
        :calculation="item.origin"
      />
    </div>
    <cy-window
      :visible="contents.selectCalculation"
      footer
      @close="toggle('contents/selectCalculation', false)"
    >
      <template #title>
        <cy-icon-text icon="bx:bx-git-compare">
          {{ $lang('compare/select build') }}
        </cy-icon-text>
      </template>
      <cy-list-item
        v-for="item in calculationItems"
        :key="item.index"
        @click="toggleComparedCalculation(item.origin)"
      >
        <cy-button-check :selected="comparedCalculationItems.includes(item)" inline>
          {{ item.origin.name }}
        </cy-button-check>
      </cy-list-item>
    </cy-window>
  </div>
</template>

<script>
import { computed, ref, watch, Ref } from 'vue';

import ToggleService from '@/setup/ToggleService';
import { setupCalculationStoreState } from './setup';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';

import vue_DamageCalculationCompareItem from './damage-calculation-compare-item';

export default {
  name: 'DamageCalculationCompare',
  RegisterLang: 'Damage Calculation',
  components: {
    DamageCalculationCompareItem: vue_DamageCalculationCompareItem,
  },
  setup() {
    const { currentCalculation: mainCalculation, calculations } = setupCalculationStoreState();

    const calculationItems = computed(() => {
      return calculations.value
        .filter(calc => calc !== mainCalculation.value)
        .map((calc, index) => ({
          index,
          origin: calc,
        }));
    });

    /** @type {Ref<Array<Calculation>>} */
    const comparedCalculations = ref([]);

    const toggleComparedCalculation = calc => {
      const calcs = comparedCalculations.value;
      const idx = calcs.indexOf(calc);
      idx >= 0 ? calcs.splice(idx, 1) : calcs.push(calc);
    };

    watch(calculations, newValue => {
      comparedCalculations.value = comparedCalculations.value.filter(calc => newValue.includes(calc));
    });

    const comparedCalculationItems = computed(() => {
      return calculationItems.value.filter(calcItem => comparedCalculations.value.includes(calcItem.origin));
    });

    const { contents, toggle } = ToggleService({
      contents: ['selectCalculation'],
    });

    return {
      calculationItems,
      comparedCalculationItems,

      // methods
      toggleComparedCalculation,

      // other
      contents,
      toggle,
    };
  },
}
</script>
