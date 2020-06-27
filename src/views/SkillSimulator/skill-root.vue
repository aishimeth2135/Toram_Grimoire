<template>
  <div class="skill-root">
    <div class="skill-tree-categorys">
      <skill-tree-category v-for="stc in skillTreeCategoryStates"
        :skill-tree-category-state="stc" :key="stc.origin.id" />
    </div>
  </div>
</template>
<script>
import vue_skillTreeCategory from "./skill-tree-category.vue";

export default {
  props: ['skillRootState'],
  computed: {
    skillTreeCategoryStates() {
      return this.skillRootState.skillTreeCategoryStates.filter(p => p.visible);
    }
  },
  components: {
    'skill-tree-category': vue_skillTreeCategory
  }
}
</script>
<style lang="less" scoped>
.skill-root {
  padding: 0.6rem 0.2rem;
  min-height: 20rem;
  position: relative;
  z-index: 1;
}
</style>