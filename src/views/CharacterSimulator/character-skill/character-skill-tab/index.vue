<template>
  <div>
    <CharacterSkillItem
      v-for="skillResultsState in validResultStates"
      :key="skillResultsState.skill.skillId"
      :skill-results-state="skillResultsState"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterSkillTab',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import CharacterSkillItem from './character-skill-item.vue'

import { setupCharacterSkillBuildStore } from '../../setup'

interface Props {
  skillResultsStates: SkillResultsState[];
}

const props = defineProps<Props>()

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validResultStates = computed(() => {
  return props.skillResultsStates
    .filter(state => currentSkillBuild.value!.getSkillState(state.skill).level > 0)
})
</script>
