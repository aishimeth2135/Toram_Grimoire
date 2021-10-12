<template>
  <cy-modal :visible="visible" @close="$emit('close')">
    <template #title>
      <cy-icon-text
        v-if="once"
        icon="fluent-list-16-filled"
        text-color="water-blue"
        icon-color="water-blue"
      >
        {{ $lang('select item/title: once') }}
      </cy-icon-text>
      <cy-icon-text
        v-else
        icon="fluent-list-16-filled"
        text-color="red"
        icon-color="red"
      >
        {{ $lang('select item/title: normal') }}
      </cy-icon-text>
    </template>
    <div
      v-for="category in validCategorys"
      :key="category.origin.title"
      class="p-1 mb-2 relative"
    >
      <div
        v-if="category.origin.weaponOnly && !isWeapon"
        class="absolute w-full h-full top-0 left-0 z-1 bg-white opacity-50 cursor-not-allowed"
      />
      <cy-icon-text
        class="w-full"
        size="small"
        text-color="purple"
      >
        {{ category.origin.title }}
      </cy-icon-text>
      <div>
        <cy-button-check
          v-for="item in category.items"
          :key="item.id"
          :selected="selectedItems.some(_item => item.origin === _item.origin && item.type === _item.type)"
          @click="itemClick(item)"
        >
          {{ item.origin.statBase.title(item.type) }}
        </cy-button-check>
      </div>
    </div>
    <div class="sticky bottom-0 mt-4 py-2 bg-white flex border-t-1 border-light-2">
      <cy-button-check v-if="!forPositive" v-model:selected="showNegativeSuggestedList">
        {{ $lang('select item/show negative suggested list') }}
      </cy-button-check>
      <cy-button-border class="ml-auto" @click="$emit('close')">
        {{ $rootLang('global/close') }}
      </cy-button-border>
    </div>
  </cy-modal>
</template>
<script>
import { StatTypes } from '@/lib/Character/Stat/enums';

export default {
  name: 'EnchantSelectItem',
  RegisterLang: 'Enchant Simulator',
  props: {
    visible: {
      type: Boolean,
    },
    once: {
      type: Boolean,
      default: false,
    },
    isWeapon: {
      type: Boolean,
      default: true,
    },
    forPositive: {
      type: Boolean,
      default: false,
    },
    defaultNegative: {
      type: Boolean,
      default: false,
    },
    // origin of selected items
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['close', 'select-item'],
  data() {
    const types = [StatTypes.Constant, StatTypes.Multiplier];
    const originalCategorys = this.$store.state.datas.Enchant.categorys;
    const categorys = originalCategorys.map(category => {
      const items = [];
      category.items.forEach(item => {
        types.forEach(type => {
          if (type === StatTypes.Multiplier && !item.statBase.hasMultiplier) {
            return;
          }
          items.push({
            id: item.statBase.statId(type),
            type: type,
            origin: item,
          });
        });
      });
      return {
        origin: category,
        items,
      };
    });
    return {
      categorys,
      showNegativeSuggestedList: false,
    };
  },
  computed: {
    negativeSuggestedList() {
      if (this.isWeapon) {
        return ['def', 'mdef', 'dodge', 'natural_hp_regen', 'natural_mp_regen'];
      }
      return ['atk', 'matk', 'physical_pierce', 'magic_pierce', 'accuracy'];
    },
    validCategorys() {
      if (!this.showNegativeSuggestedList) {
        return this.categorys;
      }
      const categorys = [];
      this.categorys.forEach(category => {
        const newItems = category.items
          .filter(item => this.negativeSuggestedList.includes(item.origin.statBase.baseName));
        if (newItems.length > 0) {
          categorys.push({
            origin: category.origin,
            items: newItems,
          });
        }
      });
      return categorys;
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.showNegativeSuggestedList = this.defaultNegative;
      }
    },
  },
  methods: {
    itemClick(item) {
      this.$emit('select-item', item);
      if (this.once) {
        this.$emit('close');
      }
    },
  },
};
</script>
