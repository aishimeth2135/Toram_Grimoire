<template>
  <section>
    <div class="max-w-full overflow-x-auto">
      <div v-if="currentCalculation" class="min-w-max">
        <DamageCalculationItem
          :calc-struct-item="currentCalculation.base.calcStruct.root"
          root
        />
      </div>
    </div>
    <div class="sticky bottom-4">
      <div class="border-1 border-light-2 py-2 pl-4 pr-6 mx-3 mt-3 rounded-full flex items-center flex-wrap bg-white">
        <cy-icon-text class="ml-auto">
          {{ $lang('result/expected value') }}
        </cy-icon-text>
        <span class="text-light-3 ml-3">{{ expectedResult }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, ComputedRef } from 'vue';
import { useStore } from 'vuex';
import init from './init.js';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';

import vue_DamageCalculationItem from './damage-calculation-item';

export default {
  name: 'DamageCalculation',
  RegisterLang: 'Damage Calculation',
  components: {
    DamageCalculationItem: vue_DamageCalculationItem,
  },
  setup() {
    init();

    const store = useStore();
    /** @param {string} name */
    const createCalculation = (name) => store.dispatch('damage-calculation/createCalculation', { name });

    /** @type {ComputedRef<Calculation>} */
    const currentCalculation = computed(() => store.getters['damage-calculation/currentCalculation']);

    const expectedResult = computed(() => currentCalculation.value.result());

    createCalculation('TEST 1');

    return {
      createCalculation,
      currentCalculation,
      expectedResult,
    };
  },
};
</script>
