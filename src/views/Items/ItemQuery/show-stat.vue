<template>
  <div class="stat-scope" v-if="type != 'preview'">
    <cy-icon-text iconify-name="mdi-leaf" :text-color="negativeValue ? 'red' : 'dark'">
      <span v-for="text in restrictionTexts"
        class="restriction" :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
    </cy-icon-text>
  </div>
  <div v-else class="stat-preview">
    <span v-for="text in restrictionTexts"
      class="restriction" :key="text">{{ text }}</span><span>{{ stat.show() }}</span>
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
<style lang="less" scoped>
@deep: ~'>>>';

.stat-scope {
  display: inline-block;
  margin-right: 0.6rem;

  @{deep} svg {
    width: 0.8rem;
    height: 0.8rem;
    align-self: flex-end;
  }
  @{deep} .text {
    margin-left: 0.2rem!important;
    align-items: flex-end!important;
  }
}

.stat-preview {
  width: 100%;
  font-size: 0.9rem;
  color: var(--primary-purple);
  margin: 0;

  &.negative-value {
    color: var(--primary-red);
  }
}

.restriction {
  color: var(--primary-water-blue);
  font-size: 0.9rem;
  margin-right: 0.3rem;
}
</style>