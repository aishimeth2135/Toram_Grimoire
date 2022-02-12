<template>
  <div class="space-y-4" style="min-height: 75vh">
    <div
      v-for="skillTree in selectedSkillTrees"
      :key="skillTree.skillTreeId"
      class="border-l-1 border-light-2 pl-3"
    >
      <div>
        <cy-icon-text icon="bx:bxs-book-bookmark">{{ skillTree.name }}</cy-icon-text>
      </div>
      <div>
        <SkillTreeDiagram
          :skill-tree="skillTree"
          :get-skill-level="getSkillLevel"
          @skill-click="skillClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { LevelSkill, Skill, SkillTree } from '@/lib/Skill/Skill'

import SkillTreeDiagram from '@/views/SkillQuery/skill-tree-diagram.vue'

import { setupSkillBuildStore, setupSkillLevel } from './setup'

interface Emits {
  (evt: 'skill-click', skill: Skill): void;
}
const emit = defineEmits<Emits>()

const { currentSkillBuild } = setupSkillBuildStore()

const skillTrees: SkillTree[] = []
Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => skillTrees.push(...stc.skillTrees))

const selectedSkillTrees = computed<SkillTree[]>(() => currentSkillBuild.value?.selectedSkillTrees ?? [])

/** TODO: skill will never be LevelSkill */
const skillClick = (skill: Skill | LevelSkill) => {
  if (skill instanceof LevelSkill) {
    return
  }
  emit('skill-click', skill)
}

const { getSkillLevel } = setupSkillLevel()
</script>
