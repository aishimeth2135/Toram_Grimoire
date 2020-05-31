<template>
  <div class="branch-detail">
    <cy-icon-text v-for="(data, i) in detailShowData['@data-list']" class="detail-item line"
      :iconify-name="data.icon" :key="data.id"
      :class="data.classList ? ['text-small', ...data.classList] : ['text-small']">
      <span v-html="data.value"></span>
    </cy-icon-text>
  </div>
</template>
<script>
export default {
  props: ['detailShowData']
};
</script>
<style lang="less" scoped>
.branch-detail {
  border-bottom: 1px solid var(--primary-light);
  padding-bottom: 0.4rem;
  margin-bottom: 0.5rem;

  > .detail-item {
    margin-right: 0.6rem;
    color: var(--primary-light-4);

    &.dark {
      color: var(--primary-gray);
    }
  }
}
</style>