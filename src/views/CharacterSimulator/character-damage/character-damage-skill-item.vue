<template>
  <CardRow :selected="enabled">
    <div
      class="hover:bg-primary-5 flex items-center py-2 pl-1.5 pr-2.5 duration-150"
      :class="{
        'cursor-pointer': !selectionDisabled,
        'cursor-not-allowed opacity-50': selectionDisabled,
      }"
      @click="toggleEnabled"
    >
      <div class="mr-3 flex shrink-0 items-center" style="min-width: 10rem">
        <cy-button-check :selected="enabled" :disabled="selectionDisabled" />
        <cy-icon :icon="skillIconPath" class="ml-1.5" />
        <span class="text-primary-70 ml-2">
          {{ skillResultsState.skill.name }}
        </span>
        <div v-if="invalid" class="text-primary-30 ml-3">
          {{ t('character-simulator.skill-build.skill-invalid') }}
        </div>
      </div>
      <div v-if="skillResultsState.hasOptions && enabled" class="ml-auto inline-flex">
        <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
      </div>
    </div>
    <div v-if="enabled && !invalid" class="pb-5 pl-10 pr-3 pt-2">
      <div class="space-y-2 pl-2">
        <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
          <CharacterDamageSkillResultItem :result="result" />
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CardRow from '@/components/card/card-row.vue'

import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'
import CharacterDamageSkillResultItem from './character-damage-skill-result-item.vue'

interface Props {
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()
const { t } = useI18n()

const enabled = computed<boolean>({
  get() {
    return characterStore.getDamageCalculationSkillState(props.skillResultsState.skill).enabled
  },
  set(value) {
    characterStore.setDamageCalculationSkillEnabled(props.skillResultsState.skill, value)
  },
})

const selectionDisabled = computed(
  () => !enabled.value && characterStore.damageCalculationSkillSelectionLimitReached
)

const toggleEnabled = () => {
  if (!selectionDisabled.value) {
    enabled.value = !enabled.value
  }
}

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>
