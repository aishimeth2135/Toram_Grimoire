<template>
  <div v-if="currentSkillBuild" class="flex items-end ml-auto sticky z-10 px-2 bottom-20 mt-4">
    <cy-transition type="fade">
      <div
        v-if="contents.mainMenu"
        class="space-y-3 border-1 border-light-2 rounded-xl p-4 bg-white mr-3 overflow-y-auto"
        style="max-height: 60vh;"
      >
        <div class="flex items-center">
          <cy-title-input
            v-model:value="currentSkillBuild.name"
            icon="mdi-clipboard-text-outline"
          />
          <cy-options inline>
            <template #title>
              <cy-button-border icon="ant-design:build-outlined" />
            </template>
            <template #options>
              <cy-list-item
                v-for="(skillBuild, idx) in skillBuilds"
                :key="skillBuild.instanceId"
                :selected="skillBuild.instanceId === currentSkillBuild.instanceId"
                @click="store.setCurrentSkillBuild(idx)"
              >
                <cy-icon-text>
                  {{ skillBuild.name }}
                </cy-icon-text>
              </cy-list-item>
              <cy-list-item @click="store.createSkillBuild()">
                <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
                  {{ t('skill-simulator.create-build') }}
                </cy-icon-text>
              </cy-list-item>
            </template>
          </cy-options>
        </div>
        <div class="flex items-center">
          <cy-button-border icon="mdi-content-copy" @click="store.copyCurrentSkillBuild()">
            {{ t('global.copy') }}
          </cy-button-border>
          <cy-button-border icon="ic-baseline-delete-outline" @click="store.removeCurrentSkillBuild()">
            {{ t('global.remove') }}
          </cy-button-border>
        </div>
      </div>
      <div
        v-else-if="contents.selectSkillTree"
        class="space-y-3 border-1 border-light-2 rounded-xl p-4 bg-white mr-3 overflow-y-auto"
        style="max-height: 60vh;"
      >
        <div v-for="stc in skillTreeCategorys" :key="`stc-${stc.id}`">
          <div>
            <cy-icon-text icon="uil:books" main-color="orange" size="small">{{ stc.name }}</cy-icon-text>
          </div>
          <div class="pl-2">
            <cy-button-check
              v-for="st in stc.skillTrees"
              :key="`st-${st.skillTreeId}`"
              :selected="selectedSkillTrees.includes(st)"
              @click="currentSkillBuild!.toggleSkillTreeSelected(st)"
            >
              {{ st.name }}
            </cy-button-check>
          </div>
        </div>
      </div>
    </cy-transition>
    <div class="flex-shrink-0 flex flex-col space-y-3">
      <cy-button-circle
        icon="ic:baseline-settings"
        main-color="orange"
        @click="toggle('contents/mainMenu', null, false)"
      />
      <cy-button-circle
        icon="uil:books"
        main-color="water-blue"
        @click="toggle('contents/selectSkillTree', null, false)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { SkillTree } from '@/lib/Skill/Skill'

import ToggleService from '@/setup/ToggleService'

import { setupSkillBuildStore } from './setup'

const { t } = useI18n()

const skillTreeCategorys = Grimoire.Skill.skillRoot.skillTreeCategorys

const { store, skillBuilds, currentSkillBuild } = setupSkillBuildStore()
const selectedSkillTrees = computed<SkillTree[]>(() => currentSkillBuild.value?.selectedSkillTrees ?? [])

const { contents, toggle } = ToggleService({
  contents: ['mainMenu', 'selectSkillTree'] as const,
})
</script>
