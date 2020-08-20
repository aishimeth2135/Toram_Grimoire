<template>
  <cy-list-item class="main--equipment-item">
    <cy-icon-text :iconify-name="equipmentData.categoryIcon">
      {{ equipment.name }}
    </cy-icon-text>
  </cy-list-item>
</template>
<script>
  export default {
    props: ['equipment'],
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