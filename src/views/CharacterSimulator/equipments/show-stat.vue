<template>
  <div class="inline-block mr-3" :class="{ 'opacity-60': !statValid }">
    <cy-icon-text v-if="type !== 'custom'"
      type="item" icon="mdi-leaf"
      :text-color="negativeValue ? 'red' : 'dark'">
      <span v-for="text in restrictionTexts"
        class="text-water-blue text-sm mr-1"
        :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
    </cy-icon-text>
    <cy-icon-text v-else icon="mdi-leaf"
      :text-color="negativeValue ? 'red' : 'dark'">
      <slot></slot>
    </cy-icon-text>
  </div>
</template>
<script>
export default {
  RegisterLang: 'Character Simulator',
  props: ['stat', 'type', 'negativeValue'],
  inject: ['checkStatRestriction'],
  computed: {
    restrictionTexts() {
      return this.stat.showData().map(p => this.$lang('stat restriction text/' + p));
    },
    statValid() {
      // this.stat may be undefined when this.type is "custom"
      return  !this.stat || this.checkStatRestriction(this.stat);
    }
  }
};
</script>