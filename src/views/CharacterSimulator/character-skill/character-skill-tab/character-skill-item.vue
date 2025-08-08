<template>
  <CardRow class="px-1 pb-2 pt-2.5">
    <div class="flex h-full items-start">
      <div class="shrink-0 self-stretch pl-2 pr-3">
        <div
          class="relative flex cursor-pointer rounded-full border-1 bg-white p-1.5 duration-150 hover:border-primary-40"
          :class="invalid ? 'border-gray-20' : enabled ? 'border-primary-50' : 'border-primary-20'"
          @click="enabled = !enabled"
        >
          <cy-icon
            v-if="enabled"
            class="absolute -left-1.5 -top-1.5"
            icon="material-symbols:check-circle-rounded-sm"
          />
          <cy-icon :icon="skillIconPath" width="1.5rem" />
        </div>
      </div>
      <div class="grow pr-3 pt-1" :class="{ 'opacity-50': !enabled }">
        <div>
          <div class="flex items-center">
            <div class="flex cursor-pointer items-center" @click="enabled = !enabled">
              <span :class="invalid ? 'text-gray-50' : 'text-primary-80'">
                {{ skillResultsState.skill.name }}
              </span>
              <span :class="invalid ? 'text-gray-40' : 'text-primary-60'" class="ml-1">
                {{ `Lv.${skillResultsState.skillLevel}` }}
              </span>
            </div>
            <div v-if="skillResultsState.hasOptions" class="ml-4 flex">
              <CharacterSkillItemOptions :skill-results-state="skillResultsState" />
            </div>
          </div>
          <div v-if="invalid" class="py-2 text-sm text-gray-40">
            {{ t('character-simulator.skill-build.skill-invalid') }}
          </div>
          <div v-else-if="skillResultsState.results.length > 0">
            <div v-if="isMutipleItem" class="py-1 text-primary-30">
              {{ t('character-simulator.skill-build.skill-multiple-effects') }}
            </div>
            <CharacterSkillResultItem
              v-else
              :result="firstResult"
              :hide-name="!branchForceToggleable"
            />
          </div>
        </div>
        <div v-if="!invalid">
          <div v-if="isMutipleItem" class="pb-1.5 pt-1">
            <div v-for="result in skillResultsState.results" :key="result.container.instanceId">
              <CharacterSkillResultItem :result="result" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SkillResultsState } from '@/stores/views/character/setup'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import CardRow from '@/components/card/card-row.vue'

import CharacterSkillItemOptions from './character-skill-item-options.vue'
import CharacterSkillResultItem from './character-skill-result-item.vue'

interface Props {
  skillResultsState: SkillResultsState
  branchForceToggleable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  branchForceToggleable: false,
})

const { t } = useI18n()
const { currentSkillBuild } = storeToRefs(useCharacterSkillBuildStore())

const skillIconPath = computed(() => getSkillIconPath(props.skillResultsState.skill))

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
  return results.length > 1 || (results.length === 1 && results[0].suffixContainers.length !== 0)
})

const invalid = computed(() => props.skillResultsState.results.length === 0)
</script>
