<template>
  <div class="stat-scope">
    <cy-icon-text v-if="type != 'custom'" iconify-name="mdi-leaf"
      :text-color="negativeValue ? 'gray' : 'dark'">
      {{ stat.show() }}
    </cy-icon-text>
    <cy-icon-text v-else iconify-name="mdi-leaf"
      :text-color="negativeValue ? 'red' : 'dark'">
      <slot></slot>
    </cy-icon-text>
  </div>
</template>
<script>
export default {
  props: ['stat', 'type', 'negativeValue'],
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
    margin-left: 0.1rem;
  }
}
</style>