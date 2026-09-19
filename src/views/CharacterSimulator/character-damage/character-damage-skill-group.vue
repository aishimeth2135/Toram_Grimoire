<script lang="ts" setup>
import { ref } from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResultsState } from '@/stores/views/character/setup'

import type { SkillTree } from '@/lib/Skill/Skill'

import CardRows from '@/components/card/card-rows.vue'

import CharacterDamageSkillItem from './character-damage-skill-item.vue'

defineOptions({
  name: 'CharacterDamageSkillGroup',
})

interface Props {
  skillTree: SkillTree
  skillResultsStates: SkillResultsState[]
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()
const expanded = ref(
  props.skillResultsStates.some(state =>
    characterStore.isDamageCalculationSkillEnabled(state.skill)
  )
)
</script>

<template>
  <div>
    <button
      type="button"
      class="bg-primary-5/50 text-primary-60 border-primary-10 flex w-full cursor-pointer items-center border-y px-3 py-1.5 text-left text-sm"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span>{{ skillTree.name }}</span>
      <cy-icon
        small
        class="text-primary-30 ml-auto"
        :icon="expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
      />
    </button>
    <CardRows v-if="expanded">
      <CharacterDamageSkillItem
        v-for="skillResultsState in skillResultsStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </CardRows>
  </div>
</template>
