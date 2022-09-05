<template>
  <div>
    <div class="flex items-center">
      <cy-button-toggle v-model:selected="allSkillEnabled">
        {{ t('global.all') }}
      </cy-button-toggle>
      <cy-button-toggle v-model:selected="disableAll">
        {{ disableAllButtonTitle }}
      </cy-button-toggle>
    </div>
    <div :class="{ 'opacity-50': disableAll }">
      <CharacterSkillItem
        v-for="skillResultsState in validResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </div>
    <div class="border-t-1 border-primary-30 mt-2 pt-0.5" :class="{ 'opacity-50': disableAll }">
      <CharacterSkillItem
        v-for="skillResultsState in postponedValidResultStates"
        :key="skillResultsState.skill.skillId"
        :skill-results-state="skillResultsState"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterSkillTab',
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { SkillTypes } from '@/lib/Skill/Skill/enums'

import CharacterSkillItem from './character-skill-item.vue'

import { setupCharacterSkillBuildStore, setupCharacterStore } from '../../setup'

interface Props {
  type: SkillTypes;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { store } = setupCharacterStore()

const skillResultsStates = computed(() => {
  return (props.type === SkillTypes.Active ? store.activeSkillResultStates : store.passiveSkillResultStates) as SkillResultsState[]
})

const { currentSkillBuild } = setupCharacterSkillBuildStore()
const validResultStates = computed(() => {
  return skillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
})

const postponedSkillResultsStates = computed(() => {
  return (props.type === SkillTypes.Active ? store.postponedActiveSkillResultStates : store.postponedPassiveSkillResultStates) as SkillResultsState[]
})

const postponedValidResultStates = computed(() => {
  return postponedSkillResultsStates.value
    .filter(state => currentSkillBuild.value!.getSkillLevel(state.skill) > 0)
})

const validSkillStates = computed(() => validResultStates.value.map(state => currentSkillBuild.value!.getSkillState(state.skill)))
const allSkillEnabled = computed<boolean>({
  get() {
    return validSkillStates.value.every(state => state.enabled)
  },
  set(value) {
    validSkillStates.value.forEach(state => state.enabled = value)
  },
})

const disableAll = computed<boolean>({
  get() {
    return !(props.type === SkillTypes.Active ?
      store.setupOptions.handleActiveSkill :
      store.setupOptions.handlePassiveSkill)
  },
  set(value) {
    if (props.type === SkillTypes.Active) {
      store.setupOptions.handleActiveSkill = !value
    } else {
      store.setupOptions.handlePassiveSkill = !value
    }
  },
})

const disableAllButtonTitle = computed(() => {
  const type = props.type === SkillTypes.Active ?
    t('character-simulator.skill-build.active-skills') :
    t('character-simulator.skill-build.passive-skills')
  return t('character-simulator.skill-build.disable-skills', { type })
})
</script>
