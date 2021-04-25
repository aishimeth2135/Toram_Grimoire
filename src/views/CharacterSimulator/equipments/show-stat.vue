<template>
  <show-stat v-if="type !== 'custom'"
    :stat="stat" :negative-value="negativeValue"
    :type="type"
    :invlaid="!statValid" />
  <cy-icon-text v-else icon="mdi-leaf"
    :text-color="negativeValue ? 'red' : 'dark'">
    <slot></slot>
  </cy-icon-text>
</template>
<script>
import vue_showStat from "@components/common/show-stat.vue";

export default {
  props: ['stat', 'type', 'negativeValue'],
  inject: ['checkStatRestriction'],
  computed: {
    statValid() {
      // this.stat may be undefined when this.type is "custom"
      return  !this.stat || this.checkStatRestriction(this.stat);
    }
  },
  components: {
    'show-stat': vue_showStat
  }
};
</script>