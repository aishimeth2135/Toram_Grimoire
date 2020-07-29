<template>
  <div class="main--equipment-item">
    <cy-icon-text :iconify-name="equipmentData.categoryIcon">{{ equipment.name }}</cy-icon-text>
  </div>
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
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid var(--primary-light);
  cursor: pointer;
  transition: 0.3s;

  &:hover, &.selected {
    background-color: rgba(var(--rgb-primary-light), 0.4);
  }

  &.selected {
    color: var(--primary-purple);
  }

  > .obtain {
    color: var(--primary-light-2);
    font-size: 0.9rem;
    margin-left: 1rem;
  }

  > .right-btn {
    margin-left: auto;
  }
}
</style>