<script lang="ts" setup>
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import CharacterDashboardSideWrapper from './character-dashboard-side-wrapper.vue'

interface Props {
  skillBuild: SkillBuild
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()

const allSkillLevels = computed(() => props.skillBuild.allSkillLevels)

const displayedSkills = computed(() => {
  return allSkillLevels.value.filter(
    item => item.enabled && item.skillLevel > 0
  )
})

const passiveSkills = computed(() => {
  return displayedSkills.value.filter(item => {
    const resultState = characterStore.allPassiveSkillResultStatesMap.get(
      item.skill
    )
    return resultState && resultState.results.length > 0
  })
})

const activeSkills = computed(() => {
  return displayedSkills.value.filter(item => {
    const resultState = characterStore.allActiveSkillResultStatesMap.get(
      item.skill
    )
    return resultState && resultState.results.length > 0
  })
})
</script>

<template>
  <CharacterDashboardSideWrapper
    icon="ant-design:build-outlined"
    :title="skillBuild.name"
    :tab-path-name="CharacterSimulatorRouteNames.Skill"
  >
    <div class="space-y-1.5">
      <div
        v-for="item in activeSkills"
        :key="item.skill.skillId"
        class="flex items-center"
      >
        <cy-icon :path="getSkillIconPath(item.skill)" class="mr-2" />
        {{ item.skill.name }}
        <div class="ml-2 text-primary-60">
          {{ `Lv.${item.skillLevel}` }}
        </div>
      </div>
    </div>
    <div class="mt-3 space-y-1.5">
      <div
        v-for="item in passiveSkills"
        :key="item.skill.skillId"
        class="flex items-center"
      >
        <cy-icon :path="getSkillIconPath(item.skill)" class="mr-2" />
        {{ item.skill.name }}
        <div class="ml-2 text-primary-60">
          {{ `Lv.${item.skillLevel}` }}
        </div>
      </div>
    </div>
  </CharacterDashboardSideWrapper>
</template>
