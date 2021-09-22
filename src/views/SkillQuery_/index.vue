<template>
  <section>
    <cy-top-header class="cursor-pointer" @click="toggle('contents/mainMenu')">
      <cy-icon-text icon="ant-design:build-outlined">
      </cy-icon-text>
      <cy-button-icon
        class="ml-auto"
        :icon="contents.mainMenu ? 'akar-icons:circle-chevron-down' : 'akar-icons:circle-chevron-up'"
        :selected="contents.mainMenu"
      />
    </cy-top-header>
    <cy-top-header-menu :visible="contents.mainMenu">
      <div class="p-1">
        <cy-button-border
          v-for="stc in skillRoot.skillTreeCategorys"
          :key="stc.id"
          @click="selectCurrentSkillTreeCategory(stc)"
        >
          {{ stc.name }}
        </cy-button-border>
      </div>
      <cy-hr />
      <div v-if="currentSkillTreeCategory" class="p-1">
        <cy-button-border
          v-for="st in currentSkillTreeCategory.skillTrees"
          :key="st.id"
          @click="selectCurrentSkillTree(st)"
        >
          {{ st.name }}
        </cy-button-border>
      </div>
      <div v-if="currentSkillTree">
        <SkillTreeDiagram
          :skill-tree="currentSkillTree"
          skill-tree-type="normal"
          :current-skill="currentSkill"
          @skill-click="selectCurrentSkill"
        />
      </div>
    </cy-top-header-menu>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { useStore } from 'vuex';

import { SkillRoot, SkillTree, SkillTreeCategory, Skill } from '@/lib/Skill/Skill';

import ToggleService from '@/setup/ToggleService';

import SkillTreeDiagram from './skill-tree-diagram.vue';

const store = useStore();

const skillRoot: ComputedRef<SkillRoot> = computed(() => store.state.datas.Skill.skillRoot);

const currentSkillTreeCategory: Ref<SkillTreeCategory | null> = ref(null);
const selectCurrentSkillTreeCategory = (stc: SkillTreeCategory) => {
  currentSkillTreeCategory.value = stc;
};

const currentSkillTree: Ref<SkillTree | null> = ref(null);
const selectCurrentSkillTree = (st: SkillTree) => {
  currentSkillTree.value = st;
};

const currentSkill: Ref<Skill | null> = ref(null);
const selectCurrentSkill = (skill: Skill) => {
  currentSkill.value = skill;
};

const { toggle, contents } = ToggleService({
  contents: ['mainMenu'] as const,
});
</script>
