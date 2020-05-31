<template>
  <div class="skill-tree" :id="skillTreeId">
    <cy-sticky-header class="top">
      <cy-icon-text icon-id="rabbit-book">
        {{ skillTreeState.origin.name }}
      </cy-icon-text>
    </cy-sticky-header>
    <div class="tree-content">
      <draw-skill-tree v-bind="skillTreeState.drawOptions"></draw-skill-tree>
    </div>
  </div>
</template>
<script>
import vue_drawSkillTree from "./draw-skill-tree.vue";

import { getSkillElementId } from "./module/methods.js";

export default {
  props: ['skillTreeState'],
  computed: {
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
@deep-operator: ~'>>>';

.skill-tree {
  border-top: 1px solid var(--primary-light);
}

.top @{deep-operator} .content {
  padding-left: 0.4rem;
}

.tree-content {
  overflow-y: auto;
  width: 100%;
}
</style>