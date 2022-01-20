<template>
  <div class="skill-tree-category">
    <div class="skill-trees">
      <skill-tree v-for="st in skillTreeStates" :key="st.origin.id" :skill-tree-state="st" />
    </div>
  </div>
</template>

<script>
import vue_skillTree from './skill-tree.vue'

export default {
  components: {
    'skill-tree': vue_skillTree,
  },
  props: ['skillTreeCategoryState'],
  computed: {
    skillTreeStates() {
      return this.skillTreeCategoryState.skillTreeStates.filter(st => st.visible)
    },
  },
}
</script>

<style lang="less" scoped>
</style>
