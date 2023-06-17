<template>
  <CardRow :selected="enabled">
    <div
      class="flex cursor-pointer items-center py-2 pl-1.5 pr-2.5 duration-150 hover:bg-primary-5"
      @click="enabled = !enabled"
    >
      <div
        class="mr-3 flex flex-shrink-0 items-center"
        style="min-width: 10rem"
      >
        <cy-button-check :selected="enabled" />
        <cy-icon :path="skillIconPath" class="ml-1.5" />
        <span class="ml-2 text-primary-70">
          {{ skillResultsState.skill.name }}
        </span>
        <div v-if="invalid" class="ml-3 text-primary-30">
          {{ t('character-simulator.skill-build.skill-invalid') }}
        </div>
      </div>
      <div
        v-if="skillResultsState.hasOptions && enabled"
        class="ml-auto inline-flex"
      >
        <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
      </div>
    </div>
    <div v-if="enabled && !invalid" class="pb-5 pl-10 pr-3 pt-2">
      <div class="space-y-2 pl-2">
        <div
          v-for="result in skillResultsState.results"
          :key="result.container.instanceId"
        >
          <CharacterDamageSkillResultItem :result="result" />
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CardRow from '@/components/card/card-row.vue'

import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'
import CharacterDamageSkillResultItem from './character-damage-skill-result-item.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()

const enabled = computed<boolean>({
  get() {
    return store.getDamageCalculationSkillState(props.skillResultsState.skill)
      .enabled
  },
  set(value) {
    store.getDamageCalculationSkillState(
      props.skillResultsState.skill
    ).enabled = value
  },
})

const skillIconPath = computed(() =>
  getSkillIconPath(props.skillResultsState.skill)
)

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>
