<template>
  <div class="flex items-center mt-1">
    <div
      v-for="containerItem in containerItems"
      :key="containerItem.origin.id"
      class="inline-flex items-center mx-1 space-x-1"
    >
      <div
        v-for="item in containerItem.items"
        :key="item.origin.id"
        class="w-16 border border-light text-center"
      >
        {{ item.valueDisplay }}
      </div>
    </div>
  </div>
</template>

<script>
import { Calculation } from '@/lib/Calculation/Damage/Calculation';
import { computed, toRefs } from '@vue/runtime-core';

export default {
  name: 'DamageCalculationTableItem',
  props: {
    calculation: {
      type: Calculation,
      required: true,
    },
    order: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const { calculation, order } = toRefs(props);
    const containerItems = computed(() => {
      return order.value.map(id => {
        const container = calculation.value.containers.get(id);
        const items = Array.from(container.items.values()).map(item => {
          return {
            origin: item,
            valueDisplay: item.value + (item.base.unit ?? ''),
          };
        });
        return {
          origin: container,
          items,
        };
      });
    });

    return {
      containerItems,
    };
  },
};
</script>

