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
        @update:selected="currentContainer!.enabled = $event"
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
          @update:value="item.value = $event"
        >
          <template #title>
            <cy-icon-text v-if="!currentContainer.selectable">
              <span v-if="!item.isCustom" v-html="markText(t('damage-calculation.item-base.titles.' + item.base.id))"></span>
              <template v-else>
                {{ (item as CalcItemCustom).name }}
              </template>
            </cy-icon-text>
            <cy-button-check
              v-else
              inline
              :selected="currentContainer.currentItem === item"
              @click="currentContainer!.selectItem(item.base.id)"
            >
              {{ t('damage-calculation.item-base.titles.' + item.base.id) }}
            </cy-button-check>
          </template>
          <template #unit>
            {{ item.base.unit }}
          </template>
        </cy-input-counter>
        <cy-title-input
          v-else-if="item instanceof CalcItemCustom"
          :value="item.name"
          class="w-64"
          @update:value="item.name = $event"
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
          @click="removeCustomItem(item as CalcItemCustom)"
        />
      </div>
      <div
        v-if="currentContainer.customItemAddable"
        class="flex items-center justify-center p-1.5 border border-light-3 bg-white w-64 cursor-pointer duration-300 opacity-60 hover:opacity-100"
        @click="createCustomItem"
      >
        <cy-icon-text icon="ic:round-add-circle-outline" text-color="light-3">
          {{ t('damage-calculation.create-custom-item') }}
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
    <div v-if="typeof calcStructItem !== 'string'">
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
        <template v-for="(structItem, idx) in calcStructItem.list" :key="getCalcItemId(structItem)">
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

<script lang="ts">
export default {
  name: 'DamageCalculationItem',
};
</script>

<script lang="ts" setup>
import { computed, toRefs, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useDamageCalculationStore } from '@/stores/views/damage-calculation';

import { numberToFixed } from '@/shared/utils/number';
import { markText } from '@/shared/utils/view';

import { CalcStructItem } from '@/lib/Calculation/Damage/Calculation/base';
import { CalcItem, CalcItemCustom } from '@/lib/Calculation/Damage/Calculation';

interface Props {
  calcStructItem: CalcStructItem;
  root?: boolean;
  layer?: number;
}


const props = withDefaults(defineProps<Props>(), {
  root: false,
  layer: 0,
});

const { calcStructItem } = toRefs(props);

const { t } = useI18n();

const store = useDamageCalculationStore();

const { currentCalculation } = storeToRefs(store);

const currentContainer = computed(() => {
  if (typeof calcStructItem.value === 'string') {
    return currentCalculation.value.containers.get(calcStructItem.value) ?? null;
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

const getCalcItemId = (structItem: CalcStructItem): string => {
  if (typeof structItem === 'string') {
    return structItem;
  }
  if (structItem.operator === '+' || structItem.operator === '*') {
    return `(${getCalcItemId(structItem.left)})${structItem.operator}(${getCalcItemId(structItem.right)})`;
  }
  if (structItem.operator === '+++' || structItem.operator === '***') {
    return structItem.list.map(item => `(${getCalcItemId(item)})`).join(structItem.operator);
  }
  return structItem.toString();
};

const createCustomItem = () => {
  if (!currentContainer.value || !currentContainer.value) {
    return;
  }
  const newItem = currentContainer.value.createCustomItem();
  if (newItem) {
    newItem.name = t('damage-calculation.item-base-titles.' + currentContainer.value.currentItem.base.id);
  }
};
const removeCustomItem = (item: CalcItemCustom) => {
  if (!currentContainer.value) {
    return;
  }
  currentContainer.value.removeCustomItem(item);
};

const editedItem = ref<CalcItem | null>(null);

const toggleEditedItem = (item: CalcItem | null) => {
  editedItem.value = editedItem.value === item ? null : item;
};
</script>
