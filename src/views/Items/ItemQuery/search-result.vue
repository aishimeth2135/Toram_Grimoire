<template>
  <div class="overflow-x-auto">
    <div class="min-w-min">
      <result-item
        v-for="eq in equipments"
        :key="eq.origin.id"
        :equipment="eq"
      />
    </div>
  </div>
</template>
<script>
import vue_resultItem from "./result-item.vue";

export default {
  components: {
    'result-item': vue_resultItem,
  },
  props: ['equipments'],
}
</script>
