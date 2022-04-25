<template>
  <cy-list-item pure>
    <div class="w-full">
      <div class="flex items-center">
        <div
          class="mr-3 flex flex-shrink-0"
          style="min-width: 10rem"
        >
          <cy-button-switch
            v-model:selected="currentSkillState.enabled"
            inline
          >
            <cy-icon-text :text-color="!invalid ? 'purple' : 'gray'" :icon="skillIconPath" icon-src="image">
              {{ skillResultsState.skill.name }}
            </cy-icon-text>
          </cy-button-switch>
        </div>
        <div :class="{ 'opacity-50': !currentSkillState.enabled }">
          <template v-if="skillResultsState.results.length > 0">
            <div v-if="isMutipleItem" class="text-light-2">
              {{ t('character-simulator.skill-build.skill-multiple-effects') }}
            </div>
            <CharacterSkillResultItem
              v-else
              :result="firstResult"
              hide-name
              :skill-results-state="SkillResultsState"
            />
          </template>
          <div v-else-if="invalid" class="text-gray">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
        </div>
        <div v-if="skillResultsState.stackContainers.length > 0" class="ml-auto inline-flex">
          <cy-button-icon
            icon="ic:baseline-settings"
            inline
            @click="toggle('contents/options')"
          />
        </div>
      </div>
      <div :class="{ 'opacity-50': !currentSkillState.enabled }">
        <cy-transition type="fade">
          <div v-if="contents.options" class="my-2 flex">
            <CharacterSkillItemOptions class="ml-auto" :skill-results-state="skillResultsState" />
          </div>
        </cy-transition>
        <div v-if="isMutipleItem" class="mt-1 pl-4">
          <CharacterSkillResultItem
            v-for="result in skillResultsState.results"
            :key="result.container.instanceId"
            :result="result"
            :skill-results-state="SkillResultsState"
          />
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

import ToggleService from '@/setup/ToggleService'

import CharacterSkillResultItem from './character-skill-result-item.vue'
import CharacterSkillItemOptions from './character-skill-item-options.vue'

import { setupCharacterSkillBuildStore } from '../../setup'

interface Props {
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { currentSkillBuild } = setupCharacterSkillBuildStore()
const { contents, toggle } = ToggleService({ contents: ['options'] })

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

const currentSkillState = computed(() => currentSkillBuild.value!.getSkillState(props.skillResultsState.skill))

const firstResult = computed(() => props.skillResultsState.results[0]!)

const isMutipleItem = computed(() => {
  const results = props.skillResultsState.results
  return results.length > 1 || (results.length === 1 && results[0].suffixContainers.length !== 0)
})

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
