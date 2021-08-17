<template>
  <section></section>
</template>

<script>
import { computed, ref, ComputedRef, Ref } from 'vue';
import { useStore } from 'vuex';

import { CalculationBase } from '@/lib/Calculation/Damage/Calculation/base';
import { Calculation } from '@/lib/Calculation/Damage/Calculation';

export default {
  name: 'DamageCalculation',
  setup() {
    const store = useStore();
    /** @type {CalculationBase} */
    const calculationBase = store.state.datas.DamageCalculation.calculationBase;

    /** @type {Ref<Calculation[]>} */
    const calculations = ref([]);

    const currentCalculationIndex = ref(-1);

    /** @param {string} name */
    const createCalculation = (name) => {
      calculations.value.push(calculationBase.createCalculation(name));
      currentCalculationIndex.value += 1;
    };

    /** @type {ComputedRef<Calculation>} */
    const currentCalculation = computed(() => {
      return calculations.value[currentCalculationIndex];
    });

    return {
      createCalculation,
      currentCalculation,
    };
  },
};
</script>
