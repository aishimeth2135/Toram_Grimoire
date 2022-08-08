<template>
  <cy-list-item pure>
    <div class="w-full">
      <div class="flex items-center">
        <div
          class="mr-3 flex flex-shrink-0"
          style="min-width: 10rem"
        >
          <cy-button-check v-model:selected="enabled">
            <cy-icon-text :text-color="!invalid ? 'purple' : 'gray'" :icon="skillIconPath" icon-src="image">
              {{ skillResultsState.skill.name }}
            </cy-icon-text>
          </cy-button-check>
          <div v-if="invalid" class="text-light-2 ml-3">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
        </div>
        <div v-if="skillResultsState.hasOptions && enabled" class="ml-auto inline-flex">
          <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
        </div>
      </div>
      <div v-if="enabled && !invalid" class="pl-1 pb-1.5">
        <div class="pt-2 pl-2 space-y-2">
          <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
            <CharacterDamageSkillResultItem :result="result" />
          </div>
        </div>
      </div>
    </div>
  </cy-list-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

import CharacterDamageSkillResultItem from './character-damage-skill-result-item.vue'
import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()

const { store } = setupCharacterStore()
const { t } = useI18n()

const enabled = computed<boolean>({
  get() {
    return store.getDamageCalculationSkillState(props.skillResultsState.skill).enabled
  },
  set(value) {
    store.getDamageCalculationSkillState(props.skillResultsState.skill).enabled = value
  },
})

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>

<style lang="postcss" scoped>
:deep(.result-value--stack) {
  @apply text-water-blue;

  &.value-dark {
    @apply text-blue-green;
  }
}
</style>
