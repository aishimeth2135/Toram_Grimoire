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
        :order="CONTAINER_DISPLAY_ORDER"
      />
    </div>
  </div>
</template>

<script lang="ts">
const CONTAINER_DISPLAY_ORDER = [
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

export default {
  name: 'DamageCalculationTable',
};
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useDamageCalculationStore } from '@/stores/views/damage-calculation';

import DamageCalculationTableItem from './damage-calculation-table-item.vue';

const store = useDamageCalculationStore();
const { calculations } = storeToRefs(store);

const calculationItems = computed(() => {
  return calculations.value.map((calc, index) => ({
    index,
    origin: calc,
  }));
});
</script>
