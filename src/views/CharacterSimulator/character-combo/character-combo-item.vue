<template>
  <div class="px-4 py-2">
    <!-- <div class="flex items-center justify-center">
      <div>
        <cy-icon-text icon="mdi-sword" color="red">{{ expectedDamageSum }}</cy-icon-text>
      </div>
    </div> -->
    <div class="flex items-start max-w-full overflow-x-auto">
      <CharacterComboItemSkill
        v-for="state in comboSkillStates"
        :key="state.itemId"
        ref="comboSkillRefs"
        :combo-skill-state="state"
      />
      <div
        class="w-32 h-32 border border-light hover:border-light-2 flex items-center justify-center cursor-pointer"
        @click="combo.appendSkill()"
      >
        <cy-icon-text
          icon="ic-round-add-circle-outline"
          icon-width="2.5rem"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import { isNumberString } from '@/shared/utils/string'

import { CharacterCombo } from '@/lib/Character/CharacterCombo'
import { Skill } from '@/lib/Skill/Skill'

import CharacterComboItemSkill from './character-combo-item-skill.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  combo: CharacterCombo;
}

const props = defineProps<Props>()

const comboSkillRefs: Ref<InstanceType<typeof CharacterComboItemSkill>[]> = ref([])

// const expectedDamageSum = computed(() => comboSkillRefs.value.reduce((sum, item) => sum + item.expectedResultSum, 0))
const { store } = setupCharacterStore()

const getMpCost = (skill: Skill) => {
  const resultState = (store.damageSkillResultStates as SkillResultsState[]).find(state => state.skill.skillId === skill.skillId) ?? null
  if (!resultState || !resultState.basicContainer) {
    return 0
  }
  const mpCost = resultState.basicContainer.getValue('mp_cost')
  return isNumberString(mpCost) ? parseInt(mpCost, 10) : 0
}

const comboSkillStates = computed(() => props.combo.getComboSkillStates(getMpCost))
</script>
