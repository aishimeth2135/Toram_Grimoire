<template>
  <div
    v-if="type !== 'preview'"
    class="stat-scope inline-block mr-3"
    :class="{ 'opacity-60': invalid }"
  >
    <cy-icon-text
      icon="mdi-leaf"
      type="item"
      :text-color="negativeValue ? 'red' : 'dark'"
    >
      <span
        v-for="text in restrictionTexts"
        :key="text"
        class="text-water-blue text-sm mr-1"
      >
        {{ text }}
      </span>
      <span>{{ stat.show() }}</span>
    </cy-icon-text>
  </div>
  <div v-else class="w-full text-sm text-purple m-0">
    <span
      v-for="text in restrictionTexts"
      :key="text"
      class="text-water-blue text-sm mr-1"
    >{{ text }}</span><span>{{ stat.show() }}</span>
  </div>
</template>
<script>
import { Stat, StatRestriction } from '@/lib/Character/Stat';

export default {
  props: {
    stat: {
      type: [Stat, StatRestriction],
    },
    type: {
      type: String,
      validation: v => ['normal', 'preview'].includes(v),
      default: 'normal',
    },
    negativeValue: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    restrictionTexts() {
      if (this.stat instanceof StatRestriction) {
        return this.stat.restrictionTexts();
      }
      return [];
    },
  },
};
</script>
