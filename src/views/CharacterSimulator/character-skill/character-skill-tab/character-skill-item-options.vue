<template>
  <cy-popover placement="bottom-start">
    <template #default="{ shown }">
      <div class="flex">
        <cy-button-icon icon="ic:baseline-settings" inline :selected="shown" />
      </div>
    </template>
    <template #popper>
      <div class="p-3">
        <CharacterSkillItemOptionsStack
          v-for="container in skillResultsState.stackContainers"
          :key="container.branchItem.stackId!"
          :container="container"
        />
        <div class="mt-2 space-y-1.5">
          <div v-for="state in formulaExtraStates" :key="state.id">
            <cy-input-counter
              v-model:value="state.value"
              title-icon="ic:round-numbers"
              :title="state.text"
              :range="[state.min, state.max]"
            />
          </div>
        </div>
      </div>
    </template>
  </cy-popover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import {
  SkillFormulaExtraVarState,
  SkillResultsState,
} from '@/stores/views/character/setup'

import CharacterSkillItemOptionsStack from './character-skill-item-options-stack.vue'

import { setupCharacterStore } from '../../setup'

interface Props {
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()

const formulaExtraStates = computed(() => {
  const states: SkillFormulaExtraVarState[] = []
  props.skillResultsState.results.forEach(result => {
    const branchState = store.getSkillBranchState(
      result.container.branchItem.default
    )
    states.push(
      ...branchState.formulaExtraIds.map(id =>
        branchState.getFormulaExtraState(id)
      )
    )
  })
  return states
})
</script>
