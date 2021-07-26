<template>
  <div class="stats">
    <ShowStat v-for="stat in statDatas" :key="stat.iid" class="item mr-4" type="custom">
      <span v-html="stat.text" />
    </ShowStat>
  </div>
</template>
<script>
import vue_ShowStat from "../equipments/show-stat.vue";

export default {
  components: {
    'ShowStat': vue_ShowStat,
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
