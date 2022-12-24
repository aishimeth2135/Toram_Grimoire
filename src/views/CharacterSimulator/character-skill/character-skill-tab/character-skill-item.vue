<template>
  <CardRow class="pt-2.5 pb-2 px-1">
    <div class="flex items-start h-full">
      <div class="flex-shrink-0 self-stretch pl-2 pr-3">
        <div
          class="p-1.5 border-1 rounded-full flex relative bg-white cursor-pointer duration-150 hover:border-primary-40"
          :class="
            invalid
              ? 'border-gray-20'
              : enabled
              ? 'border-primary-50'
              : 'border-primary-20'
          "
          @click="enabled = !enabled"
        >
          <cy-icon-text
            v-if="enabled"
            class="absolute -top-1.5 -left-1.5"
            icon="material-symbols:check-circle-rounded"
          />
          <cy-icon-text
            :icon="skillIconPath"
            icon-src="image"
            icon-width="1.5rem"
          />
        </div>
      </div>
      <div class="w-full pt-1 pr-3" :class="{ 'opacity-50': !enabled }">
        <div>
          <div class="flex items-center">
            <div
              class="cursor-pointer"
              :class="invalid ? 'text-gray-50' : 'text-primary-80'"
              @click="enabled = !enabled"
            >
              {{ skillResultsState.skill.name }}
            </div>
            <div v-if="skillResultsState.hasOptions" class="ml-4 flex">
              <CharacterSkillItemOptions
                :skill-results-state="skillResultsState"
              />
            </div>
          </div>
          <div v-if="invalid" class="text-gray-40 text-sm py-2">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
          <div v-else-if="skillResultsState.results.length > 0">
            <div v-if="isMutipleItem" class="text-primary-30 py-1">
              {{ t('character-simulator.skill-build.skill-multiple-effects') }}
            </div>
            <CharacterSkillResultItem v-else :result="firstResult" hide-name />
          </div>
        </div>
        <div v-if="!invalid">
          <div v-if="isMutipleItem" class="pt-1 pb-1.5">
            <div
              v-for="result in skillResultsState.results"
              :key="result.container.instanceId"
            >
              <CharacterSkillResultItem :result="result" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'

import CardRow from '@/components/card/card-row.vue'

import CharacterSkillItemOptions from './character-skill-item-options.vue'
import CharacterSkillResultItem from './character-skill-result-item.vue'

import { setupCharacterSkillBuildStore } from '../../setup'

interface Props {
  skillResultsState: SkillResultsState
}

const props = defineProps<Props>()

const { t } = useI18n()
const { currentSkillBuild } = setupCharacterSkillBuildStore()

const skillIconPath = computed(() =>
  getSkillIconPath(props.skillResultsState.skill)
)

const currentSkillState = computed(() =>
  currentSkillBuild.value!.getSkillState(props.skillResultsState.skill)
)

const enabled = computed<boolean>({
  set(value) {
    currentSkillState.value.enabled = value
  },
  get() {
    return currentSkillState.value.enabled
  },
})

const firstResult = computed(() => props.skillResultsState.results[0]!)

const isMutipleItem = computed(() => {
  const results = props.skillResultsState.results
  return (
    results.length > 1 ||
    (results.length === 1 && results[0].suffixContainers.length !== 0)
  )
})

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>
