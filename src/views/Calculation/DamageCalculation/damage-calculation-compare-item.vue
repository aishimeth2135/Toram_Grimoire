<template>
  <div class="p-2 border-t border-light">
    <div class="text-purple text-sm mb-1">{{ calculation.name }}</div>
    <div class="flex items-center">
      <cy-icon-text icon="ant-design:star-outlined">
        {{ $lang('result/expected') }}
      </cy-icon-text>
      <span class="text-light-3 ml-2 mr-4">{{ calculationResult }}</span>
      <div :class="calculationResultDifferenceRate >= 0 ? 'text-water-blue' : 'text-red'">
        {{ (calculationResultDifferenceRate >= 0 ? '+' : '') + calculationResultDifferenceRate + '%' }}
      </div>
    </div>
    <div class="mt-2 space-y-1 px-2">
      <div
        v-for="comparedItem in comparedItems"
        :key="comparedItem.item.base.id"
        class="flex items-center"
      >
        <cy-icon-text class="mr-2" size="small">
          <span v-html="markText($lang('item base: title/' + comparedItem.item.base.id))"></span>
        </cy-icon-text>
        <span :class="calculationResultDifferenceRate >= 0 ? 'text-water-blue' : 'text-red'" class="text-sm">
          {{ (comparedItem.value > 0 ? '+' : '') + comparedItem.value + (comparedItem.item.base.unit ?? '') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, toRefs } from 'vue';
import { Calculation } from '@/lib/Calculation/Damage/Calculation';
import { numberToFixed } from '@utils/number';
import { markText } from '@utils/view';

export default {
  name: 'DamageCalculationCompareItem',
  RegisterLang: 'Damage Calculation',
  props: {
    comparedCalculation: {
      type: Calculation,
      required: true,
    },
    calculation: {
      type: Calculation,
      required: true,
    },
    calcStruct: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { calculation, comparedCalculation, calcStruct } = toRefs(props);

    const calculationResult = computed(() => calculation.value.result(calcStruct.value));
    const calculationResultDifferenceRate = computed(() => {
      const comparedResult = comparedCalculation.value.result(calcStruct.value);
      return numberToFixed((calculationResult.value - comparedResult) * 100 / comparedResult, 1);
    });

    const comparedItems = computed(() => {
      const result = [];
      Array.from(calculation.value.containers.values()).forEach(container => {
        const comparedContainer = comparedCalculation.value.containers.get(container.base.id);
        if (container.selectable) {
          result.push({
            item: container.currentItem,
            value: container.currentItem.value - comparedContainer.currentItem.value,
          });
        } else {
          Array.from(container.items.values()).forEach(item => {
            const comparedItem = comparedContainer.items.get(item.base.id);
            result.push({
              item,
              value: item.value - comparedItem.value,
            });
          });
        }
      });
      return result.filter(item => item.value !== 0);
    });

    return {
      calculationResult,
      comparedItems,
      calculationResultDifferenceRate,
      markText,
    };
  },
}
</script>
