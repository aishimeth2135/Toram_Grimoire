<template>
  <div v-if="type !== 'preview'" class="inline-block mr-3">
    <cy-icon-text icon="mdi-leaf"
      type="item"
      :text-color="negativeValue ? 'red' : 'dark'">
      <span v-for="text in restrictionTexts"
        class="text-water-blue text-sm mr-1"
        :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
    </cy-icon-text>
  </div>
  <div v-else
    class="w-full text-sm mt-1 text-purple pl-7 text-left"
    :class="{ 'text-red': negativeValue }">
    <span v-for="text in restrictionTexts"
      class="text-water-blue text-sm mr-1"
      :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
  </div>
</template>
<script>
export default {
  props: ['stat', 'negativeValue', 'type'],
  computed: {
    restrictionTexts() {
      return this.stat.showData().map(p => this.$lang('stat restriction text/' + p));
    }
  }
};
</script>