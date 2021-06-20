<template>
  <cy-window :visible="visible" @close="$emit('close')">
    <template #title>
      <cy-icon-text v-if="once" icon="fluent-list-16-filled"
        text-color="water-blue" icon-color="water-blue">
        {{ $lang('select item/title: once') }}
      </cy-icon-text>
      <cy-icon-text v-else icon="fluent-list-16-filled"
        text-color="red" icon-color="red">
        {{ $lang('select item/title: normal') }}
      </cy-icon-text>
    </template>
    <div v-for="category in categorys"
      :key="category.origin.title"
      class="p-1 mt-2 relative">
      <div v-if="category.origin.weaponOnly && !isWeapon"
        class="absolute w-full h-full top-0 left-0 z-1 bg-white opacity-50 cursor-not-allowed">
      </div>
      <cy-icon-text class="w-full"
        text-size="small" text-color="purple">
        {{ category.origin.title }}
      </cy-icon-text>
      <div>
        <cy-button v-for="item in category.items"
          :key="item.id"
          @click="itemClick(item)">
          {{ item.origin.statBase.title(item.type) }}
        </cy-button>
      </div>
    </div>
  </cy-window>
</template>
<script>
import { StatBase } from "@/lib/Character/Stat";

export default {
  RegisterLang: "Enchant Simulator",
  props: {
    visible: {
      type: Boolean
    },
    once: {
      type: Boolean,
      default: false
    },
    isWeapon: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['close', 'selectItem'],
  data() {
    const types = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    const originalCategorys = this.$store.state.datas.enchant.categorys;
    const categorys = originalCategorys.map(category => {
      const items = [];
      category.items.forEach(item => {
        types.forEach(type => {
          if (type === StatBase.TYPE_MULTIPLIER && !item.statBase.hasMultiplier) {
            return;
          }
          items.push({
            id: item.statBase.statId(type),
            type: type,
            origin: item
          });
        })
      })
      return {
        origin: category,
        items
      };
    });
    return {
      categorys
    };
  },
  methods: {
    itemClick(item) {
      this.$emit('selectItem', item);
      if (this.once) {
        this.$emit('close');
      }
    }
  }
}
</script>