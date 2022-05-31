<template>
  <div class="space-y-4 px-1">
    <cy-default-tips
      v-if="selectedSkillTrees.length === 0"
      icon="bx:message-rounded-edit"
      class="my-6"
    >
      {{ t('skill-simulator.default-tips') }}
    </cy-default-tips>
    <div
      v-for="skillTree in selectedSkillTrees"
      :key="skillTree.skillTreeId"
      :ref="(el) => skillTreeElements.set(skillTree.skillTreeId, el as (HTMLElement | null))"
      class="border-l-2 border-light-2 pl-3 pt-1"
    >
      <div>
        <cy-icon-text icon="bx:bxs-book-bookmark">{{ skillTree.name }}</cy-icon-text>
      </div>
      <div class="max-w-full overflow-x-auto">
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
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { Skill, SkillTree } from '@/lib/Skill/Skill'

import SkillTreeDiagram from '@/views/SkillQuery/skill-tree-diagram.vue'

import { setupSkillBuildStore, setupSkillLevel } from './setup'

interface Emits {
  (evt: 'skill-click', skill: Skill): void;
}
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { currentSkillBuild } = setupSkillBuildStore()

const skillTrees: SkillTree[] = []
Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => skillTrees.push(...stc.skillTrees))

const selectedSkillTrees = computed<SkillTree[]>(() => currentSkillBuild.value?.selectedSkillTrees ?? [])

const skillClick = (skill: Skill) => {
  emit('skill-click', skill)
}

const { getSkillLevel } = setupSkillLevel()

const skillTreeElements = reactive(new Map<string, HTMLElement | null>())
const goSkillTree = (skillTree: SkillTree) => {
  skillTreeElements.get(skillTree.skillTreeId)?.scrollIntoView({ behavior: 'smooth' })
}

defineExpose({
  goSkillTree,
})
</script>
