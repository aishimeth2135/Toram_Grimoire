<template>
  <div class="skill-tree-category">
    <div class="skill-trees">
      <skill-tree v-for="st in skillTreeStates" :skill-tree-state="st" :key="st.origin.id" />
    </div>
  </div>
</template>
<script>
import vue_skillTree from "./skill-tree.vue";

export default {
  props: ['skillTreeCategoryState'],
  computed: {
    skillTreeStates() {
        return this.skillTreeCategoryState.skillTreeStates.filter(st => st.visible);
    }
  },
  components: {
    'skill-tree': vue_skillTree
  }
};
</script>
<style lang="less" scoped>
</style>