<template>
  <div>
    <result-item v-for="data in equipmentDatas"
      :key="data.iid" :equipment="data.equipment" />
  </div>
</template>
<script>
import vue_resultItem from "./result-item.vue";

export default {
  props: ['equipments'],
  computed: {
    equipmentDatas() {
      return (this.equipments || []).map((p, i) => {
        return {
          iid: i,
          equipment: p
        };
      });
    }
  },
  components: {
    'result-item': vue_resultItem
  }
}
</script>