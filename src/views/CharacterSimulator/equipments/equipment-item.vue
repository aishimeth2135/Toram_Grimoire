<template>
  <cy-list-item class="main--equipment-item" :selected="selected">
    <cy-icon-text :icon="equipmentData.categoryIcon"
      :class="{ 'opacity-50': disabled }"
      :icon-color="equipment.isCustom ? 'green' : 'light-2'"
      :text-color="isCurrent ? 'light-4' : 'dark'">
      <span>{{ equipment.name }}</span><span v-if="equipment.hasRefining && equipment.refining != 0"
        class="ml-1 text-water-blue">+{{ equipment.refining }}</span>
    </cy-icon-text>
  </cy-list-item>
</template>
<script>
  export default {
    props: {
      'equipment': {},
      'disabled': {
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