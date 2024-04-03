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
    <CardRows :class="{ 'opacity-50': disableAll }" class="min-w-[30rem]">
      <CharacterSkillItem
        v-for="skillResultsState in validResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </CardRows>
    <CardRows
      v-if="postponedValidResultStates.length > 0"
      class="border-t-1 border-primary-30 pt-0.5"
      :class="{ 'opacity-50': disableAll }"
    >
      <CharacterSkillItem
        v-for="skillResultsState in postponedValidResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </CardRows>
  </CardRowsWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { SkillResultsState } from '@/stores/views/character/setup'
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

const { currentSkillBuild } = storeToRefs(useCharacterSkillBuildStore())
const validResultStates = computed(() => {
  return skillResultsStates.value.filter(
    state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0
  )
})

const postponedSkillResultsStates = computed<SkillResultsState[]>(() => {
  return props.type === SkillTypes.Active
    ? characterStore.postponedActiveSkillResultStates
    : characterStore.postponedPassiveSkillResultStates
})

const postponedValidResultStates = computed(() => {
  return postponedSkillResultsStates.value.filter(
    state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0
  )
})

const validSkillStates = computed(() =>
  validResultStates.value.map(state =>
    currentSkillBuild.value!.getSkillState(state.skill)
  )
)
const allSkillEnabled = computed<boolean>({
  get() {
    return validSkillStates.value.every(state => state.enabled)
  },
  set(value) {
    validSkillStates.value.forEach(state => (state.enabled = value))
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
