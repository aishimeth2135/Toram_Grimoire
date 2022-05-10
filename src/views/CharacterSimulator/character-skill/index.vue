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
            v-for="skillBuild in skillBuilds"
            :key="skillBuild.instanceId"
            :selected="skillBuild.instanceId === currentSkillBuild.instanceId"
            @click="characterStore.setCharacterSkillBuild(skillBuild)"
          >
            <cy-icon-text>
              {{ skillBuild.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
    </div>
    <div class="pt-3 flex items-center max-w-full overflow-x-auto">
      <cy-button-border :selected="tabs.active" icon="uil:books" @click="toggle('tabs/active', true, false)">
        {{ t('character-simulator.skill-build.active-skills') }}
      </cy-button-border>
      <cy-button-border :selected="tabs.passive" icon="uil:books" @click="toggle('tabs/passive', true, false)">
        {{ t('character-simulator.skill-build.passive-skills') }}
      </cy-button-border>
      <cy-button-icon
        icon="ic:round-settings"
        :selected="contents.options"
        @click="toggle('contents/options')"
      />
    </div>
    <div v-if="contents.options" class="border-1 border-light-2 rounded-md mt-2 mb-4 p-3 bg-white">
      <cy-button-check v-model:selected="characterStore.setupOptions.skillDisplayStatsOnly">
        {{ t('character-simulator.skill-build.display-stats-only') }}
      </cy-button-check>
    </div>
    <div class="pt-3 overflow-x-auto">
      <div style="min-width: 25rem">
        <CharacterSkillTab :type="tabs.active ? SkillTypes.Active : SkillTypes.Passive" />
      </div>
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

import { useCharacterStore } from '@/stores/views/character'

import { SkillTypes } from '@/lib/Skill/Skill/enums'

import ToggleService from '@/setup/ToggleService'

import CharacterSkillTab from './character-skill-tab/index.vue'

import { setupCharacterSkillBuildStore } from '../setup'

const { t } = useI18n()

const { tabs, contents, toggle } = ToggleService({
  tabs: [{ name: 'active', default: true }, 'passive'] as const,
  contents: ['options'] as const,
})

const characterStore = useCharacterStore()

const { skillBuilds, currentSkillBuild } = setupCharacterSkillBuildStore()
</script>
