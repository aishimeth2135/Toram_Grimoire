<template>
  <cy-list-item pure>
    <div class="w-full">
      <div class="flex items-center">
        <div
          class="mr-3 flex flex-shrink-0"
          style="min-width: 10rem"
        >
          <cy-button-switch
            v-model:selected="enabled"
            inline
          >
            <cy-icon-text :text-color="!invalid ? 'purple' : 'gray'" :icon="skillIconPath" icon-src="image">
              {{ skillResultsState.skill.name }}
            </cy-icon-text>
          </cy-button-switch>
          <div v-if="invalid" class="text-gray">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
        </div>
      </div>
      <div v-if="enabled" class="py-2 space-y-2">
        <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
          <CharacterDamageSkillResultItem :result="result" />
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

import CharacterDamageSkillResultItem from './character-damage-skill-result-item.vue'

interface Props {
  skillResultsState: SkillResultsState;
}

const props = defineProps<Props>()

const { t } = useI18n()

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
