<template>
  <div class="overflow-x-auto">
    <div class="min-w-min">
      <ItemQueryResultItem
        v-for="eq in equipments"
        :key="eq.origin.id"
        :equipment="eq"
      />
    </div>
  </div>
</template>
<script>
import vue_ItemQueryResultItem from "./item-query-result-item";

export default {
  components: {
    ItemQueryResultItem: vue_ItemQueryResultItem,
  },
  props: {
    equipments: {
      type: Array,
      required: true,
    },
  },
}
</script>
