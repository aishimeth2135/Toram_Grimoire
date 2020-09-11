<template>
  <cy-list-item class="main--equipment-item" :selected="selected">
    <cy-icon-text :iconify-name="equipmentData.categoryIcon"
      :class="{ 'disable': disable }"
      :icon-color="equipment.isCustom ? 'green' : 'light-2'"
      :text-color="isCurrent ? 'light-4' : 'dark'">
      <span>{{ equipment.name }}</span><span v-if="equipment.hasRefining && equipment.refining != 0"
        class="refining">+{{ equipment.refining }}</span>
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
      'isCurrent': {
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
.disable {
  opacity: 0.5;
}
.refining {
  color: var(--primary-water-blue);
  margin-left: 0.3rem;
}
</style>