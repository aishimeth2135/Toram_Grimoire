<template>
  <div>
    <div>
      <CharacterDamageSkillItem
        v-for="skillResultsState in validResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterDamage',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import CharacterDamageSkillItem from './character-damage-skill-item.vue'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../setup'


const { store } = setupCharacterStore()

const skillResultsStates = computed(() => {
  return store.damageSkillResultStates as SkillResultsState[]
})

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validResultStates = computed(() => {
  return skillResultsStates.value
    .filter(state => {
      const skillState = currentSkillBuild.value!.getSkillState(state.skill)
      return skillState.level > 0 || skillState.starGemLevel > 0
    })
})
</script>
