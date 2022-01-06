<template>
  <section class="app--skill-query--wrapper flex flex-col">
    <cy-top-header class="cursor-pointer" @click="toggle('contents/search')">
      <cy-icon-text v-if="currentSkill" icon="bx:bxs-book-bookmark">
        {{ currentSkill.name }}
      </cy-icon-text>
      <div v-else class="text-light-2 ml-2">{{ t('skill-query.search-tips') }}</div>
      <cy-button-icon
        class="ml-auto"
        icon="bx:bx-search"
      />
    </cy-top-header>
    <div class="px-1">
      <div ref="skillTreeCategoryMenuElement" class="p-1">
        <cy-button-border
          v-for="stc in skillRoot.skillTreeCategorys"
          :key="stc.id"
          icon="uil:books"
          :selected="currentSkillTreeCategory?.id === stc.id"
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
          icon="bx:bxs-book-bookmark"
          :selected="currentSkillTree?.id === st.id"
          @click="selectCurrentSkillTree(st)"
        >
          {{ st.name }}
        </cy-button-border>
      </div>
      <div v-if="currentSkillTree" class="max-w-full overflow-x-auto">
        <SkillTreeDiagram
          :skill-tree="currentSkillTree"
          skill-tree-type="normal"
          :current-skill="currentSkill"
          @skill-click="selectCurrentSkill"
        />
      </div>
    </div>
    <div
      v-if="currentSkill"
      ref="skillEffectElement"
      class="pt-10"
      style="min-height: 50vh;"
    >
      <div v-if="contents.skillEffect" class="border-t-1 border-orange pt-4">
        <SkillEffect
          :skill-effect-item="currentSkillEffectItem"
          @set-current-skill="skill => selectCurrentSkill(skill, true)"
        />
      </div>
    </div>
    <div
      v-if="currentSkillTree"
      class="flex items-end ml-auto sticky z-10 px-2 bottom-14 mt-4"
    >
      <cy-button-circle icon="icon-park-outline:to-top-one" main-color="purple" @click="goToSkillTop" />
    </div>
    <SkillQueryMenu
      v-if="currentSkillTree"
      v-model:selected-equipment="currentEquipment"
      :skill-computing-container="computingContainer"
      :skill-tree="currentSkillTree"
    />
    <SkillQuerySearch
      v-if="contents.search"
      @close="toggle('contents/search', false)"
      @submit="selectCurrentSkillFromSearch"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { useDatasStore } from '@/stores/app/datas';

import { SkillRoot, SkillTree, SkillTreeCategory, Skill } from '@/lib/Skill/Skill';
import { EquipmentRestriction } from '@/lib/Skill/SkillComputingContainer';

import ToggleService from '@/setup/ToggleService';

import SkillTreeDiagram from './skill-tree-diagram.vue';
import SkillEffect from './skill-effect.vue';
import SkillQueryMenu from './skill-query-menu/index.vue';
import SkillQuerySearch from './skill-query-search.vue';

import { setupComputingContainer } from './setup';

const datasStore = useDatasStore();

const { toggle, contents } = ToggleService({
  contents: ['skillEffect', 'search'] as const,
});

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const skillEffectElement: Ref<HTMLElement | null> = ref(null);
const jumpToSkillEffect = async () => {
  await nextTick();
  if (skillEffectElement.value) {
    skillEffectElement.value.scrollIntoView({ behavior: 'smooth' });
  }
};
const skillTreeCategoryMenuElement: Ref<HTMLElement | null> = ref(null);
const goToSkillTop = async () => {
  await nextTick();
  if (skillTreeCategoryMenuElement.value) {
    skillTreeCategoryMenuElement.value.scrollIntoView({ behavior: 'auto' });
  }
};

const skillRoot: ComputedRef<SkillRoot> = computed(() => datasStore.Skill!.skillRoot);

const currentSkillTreeCategory: Ref<SkillTreeCategory | null> = ref(null);
const currentSkillTree: Ref<SkillTree | null> = ref(null);
const currentSkill: Ref<Skill | null> = ref(null);

const updateRouteParam = (id: string) => {
  router.replace({ name: 'SkillQuery', params: { skillId: id } });
};

const selectCurrentSkillTreeCategory = (stc: SkillTreeCategory) => {
  currentSkillTreeCategory.value = stc;
  currentSkillTree.value = null;
  currentSkill.value = null;
  toggle('contents/skillEffect', false);
  updateRouteParam(stc.id.toString());
};

const selectCurrentSkillTree = (st: SkillTree) => {
  currentSkillTree.value = st;
  currentSkill.value = null;
  toggle('contents/skillEffect', false);
  updateRouteParam(st.skillTreeId);
};

const selectCurrentSkill = (skill: Skill, syncParent = false) => {
  if (syncParent) {
    currentSkillTreeCategory.value = skill.parent.parent;
    currentSkillTree.value = skill.parent;
  }
  currentSkill.value = skill;
  toggle('contents/skillEffect', true);
  jumpToSkillEffect();

  updateRouteParam(skill.skillId);
};

const selectCurrentSkillFromSearch = (skill: Skill) => {
  toggle('contents/search');
  selectCurrentSkill(skill, true);
};

if (route.params.skillId) {
  const skillId = route.params.skillId as string;
  skillId.split('-').every((idStr, idx) => {
    const id = parseInt(idStr, 10);
    if (idx === 0) {
      const stc = skillRoot.value.skillTreeCategorys.find(item => item.id === id);
      if (stc) {
        selectCurrentSkillTreeCategory(stc);
        return true;
      }
    } else if (idx === 1) {
      const st = currentSkillTreeCategory.value!.skillTrees.find(item => item.id === id);
      if (st) {
        selectCurrentSkillTree(st);
        return true;
      }
    } else if (idx === 2) {
      const skill = currentSkillTree.value!.skills.find(item => item.id === id);
      if (skill) {
        selectCurrentSkill(skill);
        return true;
      }
    }
    return false;
  });
}

const currentEquipment: Ref<EquipmentRestriction> = ref({
  main: null,
  sub: null,
  body: null,
});

const {
  computingContainer,
  currentSkillItem,
} = setupComputingContainer(currentSkill);

const currentSkillEffectItem = computed(() => {
  if (!currentSkillItem.value) {
    return null;
  }
  return currentSkillItem.value.findEffectItem(currentEquipment.value) || null;
});
</script>
