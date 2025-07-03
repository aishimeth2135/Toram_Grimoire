<template>
  <cy-popover placement="bottom-start">
    <template #default="{ shown }">
      <div class="flex">
        <cy-button-icon icon="ic:baseline-settings" inline :selected="shown" />
      </div>
    </template>
    <template #popper>
      <div class="p-3">
        <CharacterSkillItemOptionsStack v-for="container in skillResultsState.stackContainers"
          :key="container.branchItem.stackId!" :container="container" />
        <div class="mt-2 space-y-1.5">
          <div v-for="state in formulaExtraStates" :key="state.id">
            <cy-input-counter v-model:value="state.value" :title="state.text" :range="[state.min, state.max]" />
          </div>
        </div>
      </div>
    </template>
  </cy-popover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillFormulaExtraVarState, SkillResultsState } from '@/stores/views/character/setup'

import CharacterSkillItemOptionsStack from './character-skill-item-options-stack.vue'

interface Props {
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()

const formulaExtraStates = computed(() => {
  const states: SkillFormulaExtraVarState[] = []
  props.skillResultsState.results.forEach(result => {
    const branchState = characterStore.getSkillBranchState(result.container.branchItem.default)
    states.push(...branchState.formulaExtraIds.map(id => branchState.getFormulaExtraState(id)))
  })
  return states
})
</script>
