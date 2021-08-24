<template>
  <div
    v-if="currentContainer"
    class="flex items-start"
    :style="{ 'margin-left': ((4 - layer) * 0.5) + 'rem' }"
  >
    <div class="flex items-center">
      <div
        class="p-2 w-20 text-center rounded-md bg-light bg-opacity-30 text-purple"
        :class="{ 'opacity-60': !currentContainer.enabled }"
      >
        {{ currentContainerResult }}
      </div>
      <cy-button-check
        :selected="currentContainer.enabled"
        :disabled="!currentContainer.base.controls.toggle"
        @update:selected="setContainerEnabled({ container: currentContainer, value: $event })"
      />
    </div>
    <div class="space-y-2" :class="{ 'opacity-60': !currentContainer.enabled }">
      <cy-input-counter
        v-for="item in currentContainerItems"
        :key="item.base.id"
        :range="[item.base.min, item.base.max]"
        :value="item.value"
        input-width="3rem"
        @update:value="setItemValue({ item, value: $event })"
      >
        <template #title>
          <cy-icon-text v-if="!currentContainer.selectable">
            <span v-html="markText($lang('item base: title/' + item.base.id))"></span>
          </cy-icon-text>
          <cy-button-check
            v-else
            inline
            :selected="currentContainer.currentItem === item"
            @click="setContainerCurrentItemId({ container: currentContainer, value: item.base.id })"
          >
            {{ $lang('item base: title/' + item.base.id) }}
          </cy-button-check>
        </template>
        <template #unit>
          {{ item.base.unit }}
        </template>
      </cy-input-counter>
    </div>
  </div>
  <div
    v-else
    class="border-light-3 border-opacity-70 relative py-3 px-2"
    :class="{ 'border-l-2': !root }"
    style="margin-left: -0.2rem;"
  >
    <div>
      <template v-if="calcStructItem.operator === '+' || calcStructItem.operator === '*'">
        <DamageCalculationItem :calc-struct-item="calcStructItem.left" :layer="layer + 1" />
        <div>
          <cy-icon-text
            :icon="calcStructItem.operator === '+' ? 'mono-icons:add' : 'eva:close-fill'"
            icon-width="2rem"
            class="mt-1"
            :style="{ 'margin-left': ((6 - layer) * 0.5) + 'rem' }"
          />
        </div>
        <DamageCalculationItem :calc-struct-item="calcStructItem.right" :layer="layer + 1" />
      </template>
      <template v-else-if="calcStructItem.operator === '+++' || calcStructItem.operator === '***'">
        <template v-for="(structItem, idx) in calcStructItem.list" :key="calcItemListIds[idx]">
          <div v-if="idx !== 0">
            <cy-icon-text
              :icon="calcStructItem.operator === '+++' ? 'mono-icons:add' : 'eva:close-fill'"
              icon-width="2rem"
              class="mt-1"
              :style="{ 'margin-left': ((6 - layer) * 0.5) + 'rem' }"
            />
          </div>
          <DamageCalculationItem :calc-struct-item="structItem" :layer="layer + 1" />
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { computed, ComputedRef, toRefs } from 'vue';
import { mapMutations, useStore } from 'vuex';

import { numberToFixed } from '@utils/number';
import { markText } from '@utils/view';
import { Calculation } from '@/lib/Calculation/Damage/Calculation';

export default {
  name: 'DamageCalculationItem',
  RegisterLang: 'Damage Calculation',
  props: {
    calcStructItem: {
      type: [Object, String],
      require: true,
    },
    root: {
      type: Boolean,
      default: false,
    },
    layer: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const { calcStructItem } = toRefs(props);
    const store = useStore();

    /** @type {ComputedRef<Calculation>} */
    const currentCalculation = computed(() => store.getters['damage-calculation/currentCalculation']);

    const currentContainer = computed(() => {
      if (typeof calcStructItem.value === 'string') {
        return currentCalculation.value.containers.get(calcStructItem.value);
      }
      return null;
    });

    const currentContainerResult = computed(() => {
      if (currentContainer.value) {
        const container = currentContainer.value;
        let res = container.result();
        if (!container.base.floorResult) {
          res = numberToFixed(res, 2);
        }
        return container.base.isMultiplier ? res + '%' : res;
      }
      return 0;
    });

    const currentContainerItems = computed(() => {
      if (!currentContainer.value) {
        return [];
      }
      const container = currentContainer.value;
      if (container.base.getCurrentItemId) {
        return [container.currentItem];
      }
      return Array.from(container.items.values());
    });

    const getCalcItemId = structItem => {
      if (typeof structItem === 'string') {
        return structItem;
      }
      if (structItem.operator === '+' || structItem.operator === '*') {
        return `(${getCalcItemId(structItem.left)})${structItem.operator}(${getCalcItemId(structItem.right)})`;
      }
      if (structItem.operator === '+++' || structItem.operator === '***') {
        return structItem.list.map(item => `(${getCalcItemId(item)})`).join(structItem.operator);
      }
    };

    const calcItemListIds = computed(() => {
      if (!calcStructItem.value.list) {
        return [];
      }
      return calcStructItem.value.list.map(item => getCalcItemId(item));
    });

    return {
      currentContainer,
      currentContainerResult,
      currentContainerItems,
      calcItemListIds,
      markText,
    };
  },
  methods: {
    ...mapMutations('damage-calculation/container', [
      'setItemValue',
      'setContainerEnabled',
      'setContainerCurrentItemId',
    ]),
  },
};
</script>
