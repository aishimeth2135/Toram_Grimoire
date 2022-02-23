<template>
  <section v-if="currentSkillBuild" class="px-2">
    <div class="border-b border-light py-2">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text icon="ant-design:build-outlined">
              {{ currentSkillBuild ? currentSkillBuild.name : '0.0' }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item
            v-for="(skillBuild, idx) in skillBuilds"
            :key="skillBuild.instanceId"
            :selected="skillBuild.instanceId === currentSkillBuild.instanceId"
            @click="skillBuildStore.setCurrentSkillBuild(idx)"
          >
            <cy-icon-text>
              {{ skillBuild.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
    </div>
    <div class="pt-3">
      <cy-button-border :selected="tabs.active" icon="uil:books" @click="toggle('tabs/active', true, false)">
        {{ t('character-simulator.skill-build.active-skills') }}
      </cy-button-border>
      <cy-button-border :selected="tabs.passive" icon="uil:books" @click="toggle('tabs/passive', true, false)">
        {{ t('character-simulator.skill-build.passive-skills') }}
      </cy-button-border>
    </div>
    <div class="pt-3">
      <CharacterSkillTab :type="tabs.active ? SkillTypes.Active : SkillTypes.Passive" />
    </div>
  </section>
  <cy-default-tips v-else>
    {{ t('character-simulator.skill-build.no-any-build-tips') }}
  </cy-default-tips>
</template>

<script lang="ts">
export default {
  name: 'CharacterSkill',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { SkillTypes } from '@/lib/Skill/Skill/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterSkillTab from './character-skill-tab/index.vue'

import { setupCharacterSkillBuildStore } from '../setup'

const { t } = useI18n()

const { tabs, toggle } = ToggleService({ tabs: [{ name:'active', default: true }, 'passive'] as const })

const { store: skillBuildStore, skillBuilds, currentSkillBuild } = setupCharacterSkillBuildStore()
</script>
