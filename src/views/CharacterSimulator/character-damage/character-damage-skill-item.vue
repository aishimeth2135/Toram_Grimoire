<template>
  <cy-list-item pure>
    <div class="w-full py-0.5">
      <div class="flex items-center">
        <div
          class="mr-3 flex flex-shrink-0"
          style="min-width: 10rem"
        >
          <cy-button-check
            v-model:selected="enabled"
            inline
          >
            <cy-icon-text :text-color="!invalid ? 'purple' : 'gray'" :icon="skillIconPath" icon-src="image">
              {{ skillResultsState.skill.name }}
            </cy-icon-text>
          </cy-button-check>
          <div v-if="invalid" class="text-light-2 ml-3">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
        </div>
        <div v-if="skillResultsState.stackContainers.length > 0 && enabled" class="ml-auto inline-flex">
          <cy-button-icon
            icon="ic:baseline-settings"
            inline
            @click="toggle('contents/options')"
          />
        </div>
      </div>
      <div v-if="enabled && !invalid">
        <cy-transition type="fade">
          <div v-if="contents.options" class="my-2 flex">
            <CharacterSkillItemOptions class="ml-auto" :skill-results-state="skillResultsState" />
          </div>
        </cy-transition>
        <div class="pt-2 pl-2 space-y-2">
          <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
            <CharacterDamageSkillResultItem
              :result="result"
              :basic-container="skillResultsState.basicContainer"
            />
          </div>
        </div>
      </div>
    </div>
  </cy-list-item>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

import ToggleService from '@/setup/ToggleService'

import CharacterDamageSkillResultItem from './character-damage-skill-result-item.vue'
import CharacterSkillItemOptions from '../character-skill/character-skill-tab/character-skill-item-options.vue'

interface Props {
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { contents, toggle } = ToggleService({ contents: ['options'] })

const enabled = ref(false)

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
