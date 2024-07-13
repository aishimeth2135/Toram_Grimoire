<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <cy-list-item
      v-for="skill in currentSkills"
      :key="skill.skillId"
      @click="emit('submit', skill)"
    >
      <cy-icon-text :icon="getSkillIconPath(skill)">
        {{ skill.name }}
      </cy-icon-text>
    </cy-list-item>
  </cy-modal>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import Grimoire from '@/shared/Grimoire'

import { Skill } from '@/lib/Skill/Skill'
import { SkillTypes } from '@/lib/Skill/Skill'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

interface Props {
  visible: boolean
  isLead: boolean
}
interface Emits {
  (evt: 'submit', skill: Skill): void
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const characterStore = useCharacterStore()

const showAllSkill = ref(false)
const allSkills: Skill[] = []

Grimoire.Skill.skillRoot.skillTreeCategorys.forEach(stc => {
  stc.skillTrees.forEach(st => allSkills.push(...st.skills))
})

const { currentSkillBuild } = storeToRefs(useCharacterSkillBuildStore())
const validSkills = computed(() => {
  return allSkills
    .filter(
      skill =>
        currentSkillBuild.value!.getSkillLevel(skill) > 0 &&
        !skill.types.includes(SkillTypes.Passive)
    )
    .filter(skill => characterStore.skillItemStates.has(skill))
    .map(skill => characterStore.skillItemStates.get(skill)!)
    .filter(state => {
      const effectItem = state.effectItem.value
      if (!effectItem) {
        return false
      }
      if (effectItem.basicBranchItem.hasProp('in_combo')) {
        const inCombo = effectItem.basicBranchItem.prop('in_combo')
        return inCombo !== '0' && (!props.isLead || inCombo !== 'not_lead')
      }
      return true
    })
    .map(state => state.skillItem.skill)
})

const currentSkills = computed(() =>
  showAllSkill.value ? allSkills : validSkills.value
)
</script>
