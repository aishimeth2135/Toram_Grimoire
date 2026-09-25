<template>
  <CardRowsWrapper class="overflow-x-auto">
    <div class="flex items-center px-2 pb-4 pt-3">
      <cy-button-toggle v-model:selected="allSkillEnabled">
        {{ t('global.all') }}
      </cy-button-toggle>
      <cy-button-toggle v-model:selected="disableAll">
        {{ disableAllButtonTitle }}
      </cy-button-toggle>
    </div>
    <CardRows :class="{ 'opacity-50': disableAll }" class="min-w-120">
      <CharacterSkillItem
        v-for="resultItem in validResultItem"
        :key="resultItem.resultsState.skill.skillId"
        :skill-results-state="resultItem.resultsState"
        :branch-force-toggleable="resultItem.branchForceToggleable"
      />
    </CardRows>
    <CardRows
      v-if="postponedValidResultItem.length > 0"
      class="border-primary-30 border-t pt-0.5"
      :class="{ 'opacity-50': disableAll }"
    >
      <CharacterSkillItem
        v-for="resultItem in postponedValidResultItem"
        :key="resultItem.resultsState.skill.skillId"
        :skill-results-state="resultItem.resultsState"
        :branch-force-toggleable="resultItem.branchForceToggleable"
      />
    </CardRows>
    <div
      v-if="
        type === SkillTypes.Active &&
        (buffValidResultItem.length > 0 || postponedBuffValidResultItem.length > 0)
      "
      class="border-primary-30 border-t px-3 pt-3"
    >
      <div class="text-primary-70 mb-1">
        {{ t('character-simulator.skill-build.buff-skills') }}
      </div>
      <div class="text-primary-50 gap-x-icon-tight mb-0.5 flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
        {{ t('character-simulator.skill-build.buff-skills-tips-1') }}
      </div>
      <div class="text-primary-50 gap-x-icon-tight mb-2 flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="icon-first-line text-primary-30" />
        {{ t('character-simulator.skill-build.buff-skills-tips-2') }}
      </div>
    </div>
    <CardRows
      v-if="type === SkillTypes.Active && buffValidResultItem.length > 0"
      :class="{ 'opacity-50': disableAll }"
    >
      <CharacterSkillItem
        v-for="resultItem in buffValidResultItem"
        :key="`${resultItem.resultsState.skill.skillId}-buff`"
        :skill-results-state="resultItem.resultsState"
        :branch-force-toggleable="resultItem.branchForceToggleable"
      />
    </CardRows>
    <CardRows
      v-if="type === SkillTypes.Active && postponedBuffValidResultItem.length > 0"
      class="border-primary-30 border-t pt-0.5"
      :class="{ 'opacity-50': disableAll }"
    >
      <CharacterSkillItem
        v-for="resultItem in postponedBuffValidResultItem"
        :key="`${resultItem.resultsState.skill.skillId}-postponed-buff`"
        :skill-results-state="resultItem.resultsState"
        :branch-force-toggleable="resultItem.branchForceToggleable"
      />
    </CardRows>
  </CardRowsWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import type { SkillResultsState } from '@/stores/views/character/setup'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { SkillTypes } from '@/lib/Skill/Skill'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CharacterSkillItem from './character-skill-item.vue'

defineOptions({
  name: 'CharacterSkillTab',
})

interface Props {
  type: SkillTypes
}

const props = defineProps<Props>()

const { t } = useI18n()
const characterStore = useCharacterStore()

const skillResultsStates = computed<SkillResultsState[]>(() => {
  return props.type === SkillTypes.Active
    ? characterStore.activeSkillResultStates
    : characterStore.passiveSkillResultStates
})

const postponedSkillResultsStates = computed<SkillResultsState[]>(() => {
  return props.type === SkillTypes.Active
    ? characterStore.postponedActiveSkillResultStates
    : characterStore.postponedPassiveSkillResultStates
})

const buffSkillResultsStates = computed<SkillResultsState[]>(
  () => characterStore.buffSkillResultStates
)
const postponedBuffSkillResultsStates = computed<SkillResultsState[]>(
  () => characterStore.postponedBuffSkillResultStates
)

const skillIds = computed(() => {
  return skillResultsStates.value.map(state => state.skill.id)
})

const postponedSkillIds = computed(() => {
  return postponedSkillResultsStates.value.map(state => state.skill.id)
})

const { currentSkillBuild } = storeToRefs(useCharacterSkillBuildStore())
const validResultItem = computed(() => {
  return skillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
    .map(resultsState => {
      return {
        resultsState,
        branchForceToggleable: postponedSkillIds.value.includes(resultsState.skill.id),
        skillState: currentSkillBuild.value!.getSkillState(resultsState.skill),
      }
    })
})

const postponedValidResultItem = computed(() => {
  return postponedSkillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
    .map(resultsState => {
      return {
        resultsState,
        branchForceToggleable: skillIds.value.includes(resultsState.skill.id),
      }
    })
})

const buffValidResultItem = computed(() =>
  buffSkillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
    .map(resultsState => ({
      resultsState,
      branchForceToggleable: postponedBuffSkillResultsStates.value.some(
        state => state.skill.id === resultsState.skill.id
      ),
      skillState: currentSkillBuild.value!.getSkillState(resultsState.skill),
    }))
)

const postponedBuffValidResultItem = computed(() =>
  postponedBuffSkillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
    .map(resultsState => ({
      resultsState,
      branchForceToggleable: buffSkillResultsStates.value.some(
        state => state.skill.id === resultsState.skill.id
      ),
    }))
)

const allSkillEnabled = computed<boolean>({
  get() {
    const items =
      props.type === SkillTypes.Active
        ? [...validResultItem.value, ...buffValidResultItem.value]
        : validResultItem.value
    return items.every(item => item.skillState.enabled)
  },
  set(value) {
    validResultItem.value.forEach(item => (item.skillState.enabled = value))
    if (props.type === SkillTypes.Active) {
      buffValidResultItem.value.forEach(item => (item.skillState.enabled = value))
    }
  },
})

const disableAll = computed<boolean>({
  get() {
    return !(props.type === SkillTypes.Active
      ? characterStore.setupOptions.handleActiveSkill
      : characterStore.setupOptions.handlePassiveSkill)
  },
  set(value) {
    if (props.type === SkillTypes.Active) {
      characterStore.setupOptions.handleActiveSkill = !value
    } else {
      characterStore.setupOptions.handlePassiveSkill = !value
    }
  },
})

const disableAllButtonTitle = computed(() => {
  const type =
    props.type === SkillTypes.Active
      ? t('character-simulator.skill-build.active-skills')
      : t('character-simulator.skill-build.passive-skills')
  return t('character-simulator.skill-build.disable-skills', { type })
})
</script>
