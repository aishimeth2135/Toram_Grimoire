<template>
  <div class="skill-tree" :id="skillTreeId">
    <cy-sticky-header class="top">
      <cy-icon-text icon="rabbit-book" icon-src="custom">
        {{ skillTreeState.origin.name }}
      </cy-icon-text>
    </cy-sticky-header>
    <div class="tree-content">
      <draw-skill-tree v-bind="drawSkillTreeDatas" />
    </div>
  </div>
</template>
<script>
import vue_drawSkillTree from "./draw-skill-tree.vue";

import { getSkillElementId } from "./utils";

export default {
  props: ['skillTreeState'],
  inject: ['drawSkillTreeOptions'],
  computed: {
    drawSkillTreeDatas() {
      return {
        skillTree: this.skillTreeState.levelSkillTree,
        ...this.drawSkillTreeOptions
      };
    },
    skillTreeId() {
      return 'skill-tree--' + getSkillElementId(this.skillTreeState.origin);
    }
  },
  components: {
    'draw-skill-tree': vue_drawSkillTree
  }
};
</script>
<style lang="less" scoped>

.skill-tree {
  border-top: 1px solid var(--primary-light);
}

.top ::v-deep(.content) {
  padding-left: 0.4rem;
}

.tree-content {
  overflow-y: auto;
  width: 100%;
}
</style>