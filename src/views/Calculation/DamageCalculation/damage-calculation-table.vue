<template>
  <div class="py-4 overflow-x-auto flex items-start">
    <div class="sticky left-0 min-w-max">
      <div
        v-for="item in calculationItems"
        :key="item.index"
        class="flex-shrink-0 bg-white border border-light-2 px-2 mt-1"
      >
        {{ item.origin.name }}
      </div>
    </div>
    <div>
      <DamageCalculationTableItem
        v-for="item in calculationItems"
        :key="item.index"
        :calculation="item.origin"
        :order="containerDisplayOrder"
      />
    </div>
  </div>
</template>

<script>
import { computed, ComputedRef } from 'vue';
import { useStore } from 'vuex';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';

import vue_DamageCalculationTableItem from './damage-calculation-table-item';

export default {
  name: 'DamageCalculationTable',
  components: {
    DamageCalculationTableItem: vue_DamageCalculationTableItem,
  },
  setup() {
    const store = useStore();

    /** @type {ComputedRef<Array<Calculation>>} */
    const calculations = computed(() => store.state['damage-calculation'].calculations);

    const calculationItems = computed(() => {
      return calculations.value.map((calc, index) => ({
        index,
        origin: calc,
      }));
    });

    const containerDisplayOrder = [
      'atk/base',
      'atk/dual_sword',
      'atk/two_handed',
      'target_resistance',
      'level_difference',
      'target_def_base',
      'pierce',
      'skill/constant',
      'unsheathe_attack/constant',
      'other_constant',
      'skill/multiplier',
      'critical_damage',
      'range_damage',
      'unsheathe_attack/multiplier',
      'stronger_against_element',
      'proration',
      'combo_multiplier',
      'skill/long_range',
      'stability',
      'other_multiplier',
    ];

    return {
      calculationItems,
      containerDisplayOrder,
    };
  },
}
</script>
