<template>
  <div class="stat-scope inline-block mr-3" v-if="type !== 'preview'">
    <cy-icon-text iconify-name="mdi-leaf" type="item"
      :text-color="negativeValue ? 'red' : 'dark'">
      <span v-for="text in restrictionTexts"
        class="text-water-blue text-sm mr-1"
        :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
    </cy-icon-text>
  </div>
  <div v-else class="w-full text-sm text-purple m-0">
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
      return this.stat.showData().map(p => this.$lang('equipment detail/restriction/' + p));
    }
  }
};
</script>