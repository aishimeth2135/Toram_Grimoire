<template>
  <show-stat
    v-if="type !== 'custom'"
    :stat="stat"
    :negative-value="negativeValue"
    :type="type"
    :invlaid="!statValid"
  />
  <cy-icon-text
    v-else
    icon="mdi-leaf"
    :text-color="negativeValue ? 'red' : 'dark'"
  >
    <slot />
  </cy-icon-text>
</template>

<script>
import vue_showStat from '@/components/common/show-stat.vue';

export default {
  components: {
    'show-stat': vue_showStat,
  },
  inject: ['checkStatRestriction'],
  props: ['stat', 'type', 'negativeValue'],
  computed: {
    statValid() {
      // this.stat may be undefined when this.type is "custom"
      return  !this.stat || this.checkStatRestriction(this.stat);
    },
  },
};
</script>
