<template>
  <CardRow :selected="enabled">
    <button
      class="hover:bg-primary-5 flex w-full cursor-pointer items-center py-2.5 pl-1.5 pr-3 duration-150"
      type="button"
      :disabled="selectionDisabled"
      @click="toggleEnabled"
    >
      <div class="flex min-w-40 shrink-0 items-center px-2">
        <cy-icon :icon="skillIconPath" />
        <span class="text-primary-80 ml-2.5">
          {{ skillResultsState.skill.name }}
        </span>
        <div v-if="invalid" class="text-primary-30 ml-3">
          {{ t('character-simulator.skill-build.skill-invalid') }}
        </div>
      </div>
      <div v-if="skillResultsState.hasOptions && enabled" class="ml-auto inline-flex">
        <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
      </div>
    </button>
    <div v-if="enabled && !invalid" class="flex flex-col gap-2 pb-4">
      <div
        v-for="result in skillResultsState.results"
        :key="result.container.instanceId"
        class="border-primary-10 border-t pl-5 pr-3 pt-2"
      >
        <CharacterDamageSkillResultItem :result="result" />
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
    return (
      characterStore.currentCharacterState.skillBuild?.isDamageCalculationSkillEnabled(
        props.skillResultsState.skill
      ) ?? false
    )
  },
  set(value) {
    characterStore.currentCharacterState.skillBuild?.setDamageCalculationSkillEnabled(
      props.skillResultsState.skill,
      value
    )
  },
})

const selectionDisabled = computed(
  () =>
    !enabled.value &&
    (characterStore.currentCharacterState.skillBuild?.damageCalculationSkillSelectionLimitReached ??
      false)
)

const toggleEnabled = () => {
  if (!selectionDisabled.value) {
    enabled.value = !enabled.value
  }
}

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>
