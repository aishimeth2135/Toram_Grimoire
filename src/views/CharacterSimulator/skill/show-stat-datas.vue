<template>
  <div class="stats">
    <show-stat class="item mr-4" v-for="stat in statDatas" type="custom" :key="stat.iid">
      <span v-html="stat.text"></span>
    </show-stat>
  </div>
</template>
<script>
import vue_showStat from "../equipments/show-stat.vue";

export default {
  props: ['statDatas'],
  components: {
    'show-stat': vue_showStat
  }
};
</script>
<style lang="less" scoped>
.stats {
  margin: 0 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.item {
  flex-shrink: 0;
}
</style>