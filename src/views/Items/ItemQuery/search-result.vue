<template>
  <div>
    <result-item v-for="eq in equipments"
      :key="eq.origin.id" :equipment="eq" />
  </div>
</template>
<script>
import vue_resultItem from "./result-item.vue";

export default {
  props: ['equipments'],
  components: {
    'result-item': vue_resultItem
  }
}
</script>