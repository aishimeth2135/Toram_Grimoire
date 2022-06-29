<template>
  <div class="px-4 py-3">
    <!-- <div class="flex items-center justify-center">
      <div>
        <cy-icon-text icon="mdi-sword" color="red">{{ expectedDamageSum }}</cy-icon-text>
      </div>
    </div> -->
    <div class="flex items-start max-w-full overflow-x-auto">
      <div class="text-light-2">
        <div class="mb-4">{{ `#${index + 1}` }}</div>
        <cy-button-icon
          icon="mdi-sword"
          color="blue-green"
          :selected="damageCalcEnabled"
          @click="damageCalcEnabled = !damageCalcEnabled"
        />
      </div>
      <CharacterComboItemSkill
        v-for="state in comboSkillStates"
        :key="state.itemId"
        ref="comboSkillRefs"
        :combo-skill-state="state"
      />
      <div class="w-28 flex justify-center">
        <div
          class="w-12 h-12 border-1 rounded-full border-light-2 hover:border-light-3 flex items-center justify-center cursor-pointer duration-200"
          @click="selectComboSkill(combo.appendSkill())"
        >
          <cy-icon-text
            icon="ic-round-add"
            icon-width="2.25rem"
          />
        </div>
      </div>
    </div>
    <div v-if="damageCalcEnabled" class="border-t border-light mt-2.5 pt-1">
      <CharacterComboItemDamageItem
        v-for="skillResultsState in skillResultsStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, ref } from 'vue'

import { SkillResultsState } from '@/stores/views/character/setup'

import { isNumberString } from '@/shared/utils/string'

import { CharacterCombo } from '@/lib/Character/CharacterCombo'
import { Skill } from '@/lib/Skill/Skill'

import CharacterComboItemSkill from './character-combo-item-skill.vue'
import CharacterComboItemDamageItem from './character-combo-item-damage-item.vue'

import { setupCharacterStore } from '../setup'
import { CharacterSimulatorInjectionKey } from '../injection-keys'


interface Props {
  index: number;
  combo: CharacterCombo;
}

const props = defineProps<Props>()

const damageCalcEnabled = ref(false)
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

const skillResultsStates = computed(() => {
  const allResultsStates = store.damageSkillResultStates as SkillResultsState[]
  return comboSkillStates.value
    .map(comboSkillState => {
      const skill = comboSkillState.comboSkill.skill
      if(!skill) {
        return null
      }
      return allResultsStates.find(state => state.skill.skillId === skill.skillId) ?? null
    })
    .filter(item => item !== null) as SkillResultsState[]
})

const { selectComboSkill } = inject(CharacterSimulatorInjectionKey)!
</script>
