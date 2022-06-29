<template>
  <cy-list-item pure>
    <div class="w-full pt-0.5">
      <div class="flex items-center">
        <div
          class="mr-3 flex flex-shrink-0"
          style="min-width: 10rem"
        >
          <cy-icon-text :icon="skillIconPath" icon-src="image">
            {{ skillResultsState.skill.name }}
          </cy-icon-text>
        </div>
        <div v-if="skillResultsState.stackContainers.length > 0" class="ml-auto inline-flex">
          <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
        </div>
      </div>
      <div class="pl-1 pb-1">
        <div class="pt-2 pl-2 space-y-2">
          <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
            <CharacterDamageSkillResultItem :result="result" toggleable />
          </div>
        </div>
      </div>
    </div>
  </cy-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

import CharacterDamageSkillResultItem from '../character-damage/character-damage-skill-result-item.vue'
import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'

interface Props {
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))
</script>

<style lang="postcss" scoped>
:deep(.result-value--stack) {
  @apply text-water-blue;

  &.value-dark {
    @apply text-blue-green;
  }
}
</style>
