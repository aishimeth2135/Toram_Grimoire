<template>
  <div
    v-if="currentContainer"
    class="flex items-start"
    :style="{ marginLeft: root ? '1.8rem' : ((4 - layer) * 0.5) + 'rem' }"
  >
    <div class="flex items-center">
      <div
        class="p-2 w-20 text-center rounded-md bg-light bg-opacity-30 text-purple"
        :class="{ 'opacity-60': !currentContainer.enabled }"
      >
        {{ currentContainerResult }}
      </div>
      <cy-button-switch
        :selected="currentContainer.enabled"
        :disabled="!currentContainer.base.controls.toggle"
        @update:selected="setEnabled({ container: currentContainer, value: $event })"
      />
    </div>
    <div class="space-y-2" :class="{ 'opacity-60': !currentContainer.enabled }">
      <div
        v-for="item in currentContainerItems"
        :key="item.base.id"
        class="flex items-center"
      >
        <cy-input-counter
          v-if="editedItem !== item"
          :range="[item.base.min, item.base.max]"
          :step="item.base.step"
          :value="item.value"
          input-width="3rem"
          @update:value="setItemValue({ item, value: $event })"
        >
          <template #title>
            <cy-icon-text v-if="!currentContainer.selectable">
              <span v-if="!item.isCustom" v-html="markText($lang('item base: title/' + item.base.id))"></span>
              <template v-else>
                {{ item.name }}
              </template>
            </cy-icon-text>
            <cy-button-check
              v-else
              inline
              :selected="currentContainer.currentItem === item"
              @click="setCurrentItemId({ container: currentContainer, value: item.base.id })"
            >
              {{ $lang('item base: title/' + item.base.id) }}
            </cy-button-check>
          </template>
          <template #unit>
            {{ item.base.unit }}
          </template>
        </cy-input-counter>
        <cy-title-input
          v-else
          :value="item.name"
          class="w-64"
          @update:value="setItemName({ item, value: $event })"
          @keyup.enter="toggleEditedItem(null)"
        />
        <cy-button-icon
          v-if="item.isCustom"
          icon="ant-design:edit-outlined"
          class="ml-3"
          :selected="editedItem === item"
          @click="toggleEditedItem(item)"
        />
        <cy-button-icon
          v-if="item.isCustom"
          icon="jam:close-circle"
          class="ml-2"
          @click="removeCustomItem({ container: currentContainer ,item })"
        />
      </div>
      <div
        v-if="currentContainer.customItemAddable"
        class="flex items-center justify-center p-1.5 border border-light-3 bg-white w-64 cursor-pointer duration-300 opacity-60 hover:opacity-100"
        @click="createCustomItem({
          container: currentContainer,
          name: $lang('item base: title/' + currentContainer.currentItem.base.id),
        })"
      >
        <cy-icon-text icon="ic:round-add-circle-outline" text-color="light-3">
          {{ $lang('create custon item') }}
        </cy-icon-text>
      </div>
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
import { computed, toRefs, Ref, ComputedRef, ref } from 'vue';
import { mapMutations, useStore } from 'vuex';

import { numberToFixed } from '@/shared/utils/number';
import { markText } from '@/shared/utils/view';

import { Calculation } from '@/lib/Calculation/Damage/Calculation';
import { CalcStructItem } from '@/lib/Calculation/Damage/Calculation/base';


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
    /** @type {{ calcStructItem: Ref<CalcStructItem> }} */
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
      return [
        ...Array.from(container.items.values()),
        ...container.customItems,
      ];
    });

    /**
     * @param {CalcStructItem} structItem
     * @returns {string}
     */
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

    /** @type {ComputedRef<Array<string>>} */
    const calcItemListIds = computed(() => {
      if (typeof calcStructItem.value === 'string') {
        return [];
      }
      if (calcStructItem.value.operator === '+++' || calcStructItem.value.operator === '***') {
        return calcStructItem.value.list.map(item => getCalcItemId(item));
      }
      return [];
    });

    const editedItem = ref(null);
    const toggleEditedItem = item => editedItem.value = editedItem.value === item ? null : item;

    return {
      editedItem,

      currentContainer,
      currentContainerResult,
      currentContainerItems,
      calcItemListIds,
      markText,

      toggleEditedItem,
    };
  },
  methods: {
    ...mapMutations('damage-calculation/container', [
      'setEnabled',
      'setCurrentItemId',
      'createCustomItem',
      'removeCustomItem',
      'setItemValue',
      'setItemName',
    ]),
  },
};
</script>
