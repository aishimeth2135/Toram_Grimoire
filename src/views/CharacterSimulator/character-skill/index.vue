<template>
  <section v-if="currentSkillBuild" class="px-2">
    <div class="px-2">
      <div class="inline-block">
        <cy-options
          :value="currentSkillBuild"
          :options="skillBuilds.map(skillBuild => ({ id: skillBuild.instanceId, value: skillBuild }))"
          @update:value="characterStore.setCharacterSkillBuild($event)"
        >
          <template #item="{ value }">
            <cy-icon-text icon="ant-design:build-outlined">
              {{ value.name }}
            </cy-icon-text>
          </template>
        </cy-options>
      </div>
    </div>
    <cy-hr />
    <div class="flex items-center max-w-full overflow-x-auto">
      <cy-button-action :selected="tabs.active" icon="uil:books" @click="toggle('tabs/active', true, false)">
        {{ t('character-simulator.skill-build.active-skills') }}
      </cy-button-action>
      <cy-button-action :selected="tabs.passive" icon="uil:books" @click="toggle('tabs/passive', true, false)">
        {{ t('character-simulator.skill-build.passive-skills') }}
      </cy-button-action>
      <cy-popover class="flex">
        <cy-button-icon
          icon="ic:round-settings"
          :selected="contents.options"
          @click="toggle('contents/options')"
        />
        <template #popper>
          <div class="p-3">
            <cy-button-check v-model:selected="characterStore.setupOptions.skillDisplayStatsOnly">
              {{ t('character-simulator.skill-build.display-stats-only') }}
            </cy-button-check>
          </div>
        </template>
      </cy-popover>
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
