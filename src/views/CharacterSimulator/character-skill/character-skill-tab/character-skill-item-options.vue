<template>
  <cy-popover>
    <template #default="{ shown }">
      <cy-button-icon
        icon="ic:baseline-settings"
        inline
        :selected="shown"
      />
    </template>
    <template #popper>
      <div class="p-3">
        <CharacterSkillItemOptionsStack
          v-for="container in skillResultsState.stackContainers"
          :key="container.branchItem.stackId!"
          :container="container"
        />
      </div>
    </template>
  </cy-popover>
</template>

<script lang="ts" setup>
import { SkillResultsState } from '@/stores/views/character/setup'

import CharacterSkillItemOptionsStack from './character-skill-item-options-stack.vue'

interface Props {
  skillResultsState: SkillResultsState;
}

defineProps<Props>()
</script>
