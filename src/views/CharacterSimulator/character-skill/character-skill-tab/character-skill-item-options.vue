<template>
  <div class="border-1 border-light-2 p-4 rounded-md bg-white">
    <CharacterSkillItemOptionsStack
      v-for="container in skillResultsState.stackContainers"
      :key="container.branchItem.stackId!"
      :container="container"
    />
  </div>
</template>

<script lang="ts" setup>
import { SkillResultsState } from '@/stores/views/character/setup'

import CharacterSkillItemOptionsStack from './character-skill-item-options-stack.vue'

interface Props {
  skillResultsState: SkillResultsState;
}

defineProps<Props>()
</script>
