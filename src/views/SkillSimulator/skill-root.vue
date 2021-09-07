<template>
  <div class="skill-root">
    <div class="skill-tree-categorys">
      <SkillTreeCategory
        v-for="stc in skillTreeCategoryStates"
        :key="stc.origin.id"
        :skill-tree-category-state="stc"
      />
    </div>
  </div>
</template>
<script>
import vue_SkillTreeCategory from './skill-tree-category.vue';

export default {
  components: {
    SkillTreeCategory: vue_SkillTreeCategory,
  },
  props: ['skillRootState'],
  computed: {
    skillTreeCategoryStates() {
      return this.skillRootState.skillTreeCategoryStates.filter(p => p.visible);
    },
  },
};
</script>
<style lang="less" scoped>
.skill-root {
  padding: 0.6rem 0.2rem;
  min-height: 20rem;
  position: relative;
  z-index: 1;
}
</style>
