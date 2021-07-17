<template>
  <div class="stats">
    <show-stat v-for="stat in statDatas" :key="stat.iid" class="item mr-4" type="custom">
      <span v-html="stat.text" />
    </show-stat>
  </div>
</template>
<script>
import vue_showStat from "../equipments/show-stat.vue";

export default {
  components: {
    'show-stat': vue_showStat,
  },
  props: ['statDatas'],
};
</script>
<style lang="less" scoped>
.stats {
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.item {
  flex-shrink: 0;
}
</style>
