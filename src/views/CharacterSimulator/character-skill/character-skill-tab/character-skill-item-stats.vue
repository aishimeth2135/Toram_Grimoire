<template>
  <div class="flex flex-wrap">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="text-light mr-3"
      :class="{
        'opacity-50': getSkillStatContainerValid(currentCharacter, skillResultsState, container),
      }"
    >
      <span class="text-dark" v-html="container.result"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getSkillStatContainerValid } from '@/stores/views/character/setup/utils'
import { SkillResultsState } from '@/stores/views/character/setup'

import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import { setupCharacterStore } from '../../setup'

interface Props {
  statContainers: ResultContainerStat[];
  skillResultsState: SkillResultsState;
}

const { currentCharacter } = setupCharacterStore()

defineProps<Props>()
</script>
