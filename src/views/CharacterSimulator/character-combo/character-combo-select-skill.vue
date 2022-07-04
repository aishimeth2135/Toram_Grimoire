<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <cy-list-item v-for="skill in currentSkills" :key="skill.skillId" @click="emit('submit', skill)">
      <cy-icon-text :icon="getSkillIconPath(skill)" icon-src="image">
        {{ skill.name }}
      </cy-icon-text>
    </cy-list-item>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import Grimoire from '@/shared/Grimoire'

import { Skill } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../setup'

interface Props {
  visible: boolean;
}
interface Emits {
  (evt: 'submit', skill: Skill): void;
  (evt: 'close'): void;
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { store } = setupCharacterStore()

const showAllSkill = ref(false)
const allSkills: Skill[] = []

Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => {
  stc.skillTrees.forEach(st => allSkills.push(...st.skills))
})

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validSkills = computed(() => {
  const skillResultsStates = [
    ...store.damageSkillResultStates,
    ...store.activeSkillResultStates,
    ...store.nextSkillResultStates,
  ] as SkillResultsState[]
  const skills = skillResultsStates
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
    .map(state => state.skill)
  return [...new Set(skills)]
})

const currentSkills = computed(() => showAllSkill.value ? allSkills : validSkills.value)
</script>
