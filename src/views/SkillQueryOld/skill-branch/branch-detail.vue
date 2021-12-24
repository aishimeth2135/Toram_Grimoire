<template>
  <div class="branch-detail">
    <transition-group name="slide-down" appear>
      <cy-icon-text
        v-for="(data) in detailShowData['@data-list']"
        :key="data.id"
        class="detail-item line"
        :icon="data.icon"
        :class="data.classList ? ['text-small', ...data.classList] : ['text-small']"
      >
        <span v-html="data.value" />
      </cy-icon-text>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: ['detailShowData'],
};
</script>

<style lang="less" scoped>
.branch-detail {
  border-bottom: 1px solid var(--primary-light);
  padding-bottom: 0.4rem;
  margin-bottom: 0.5rem;

  .detail-item {
    margin-right: 0.6rem;
    color: var(--primary-light-4);
    display: flex;

    &.dark {
      color: var(--primary-gray);
    }
  }
}
.slide-down-enter-from, .slide-down-leave-to {
  margin-top: -0.8rem!important;
}
.slide-down-enter-active, .slide-down-leave-active {
  transition: margin-top 0.5s ease;
}
</style>
