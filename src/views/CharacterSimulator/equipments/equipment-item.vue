<template>
  <cy-list-item class="main--equipment-item" :selected="selected">
    <cy-icon-text v-if="!disable" :iconify-name="equipmentData.categoryIcon">
      {{ equipment.name }}
    </cy-icon-text>
    <cy-icon-text v-else :iconify-name="equipmentData.categoryIcon"
      text-color="gray" icon-color="gray-light">
      {{ equipment.name }}
    </cy-icon-text>
  </cy-list-item>
</template>
<script>
  export default {
    props: {
      'equipment': {},
      'disable': {
        type: Boolean,
        default: false
      },
      'selected': {}
    },
    inject: ['getShowEquipmentData'],
    computed: {
      equipmentData() {
        return this.getShowEquipmentData(this.equipment);
      }
    }
  }
</script>
<style lang="less" scoped>
.main--equipment-item {
}
</style>