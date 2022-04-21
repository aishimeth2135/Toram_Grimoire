<template>
  <div v-if="currentSkillBuild" class="flex items-end justify-end ml-auto px-2 mt-4 space-x-3">
    <cy-transition type="fade" mode="out-in">
      <div
        v-if="contents.mainMenu"
        class="space-y-2 border-1 border-light-2 rounded-xl p-4 bg-white overflow-y-auto pointer-events-auto"
        style="max-height: 60vh;"
      >
        <div class="flex items-center">
          <cy-title-input
            v-model:value="currentSkillBuild.name"
            icon="mdi-clipboard-text-outline"
          />
          <cy-options inline>
            <template #title>
              <cy-button-circle icon="ant-design:build-outlined" small />
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
          <cy-button-border
            icon="bx:copy-alt"
            @click="store.copyCurrentSkillBuild()"
          >
            {{ t('global.copy') }}
          </cy-button-border>
          <cy-button-border
            icon="ic-baseline-delete-outline"
            main-color="gray"
            @click="removeCurrentSkillBuild"
          >
            {{ t('global.remove') }}
          </cy-button-border>
        </div>
        <div class="mt-3 pt-3 border-t border-light-2 space-x-2">
          <cy-button-border icon="uil:image-download" @click="emit('export-image')">
            {{ t('skill-simulator.export-image.title') }}
          </cy-button-border>
          <cy-button-border icon="mdi:note-text-outline" @click="emit('export-text')">
            {{ t('skill-simulator.export-text-title') }}
          </cy-button-border>
        </div>
      </div>
      <div
        v-else-if="contents.selectSkillTree"
        class="space-y-2 border-1 border-light-2 rounded-xl p-4 bg-white overflow-y-auto pointer-events-auto"
        style="max-height: 60vh;"
      >
        <div v-for="stc in skillTreeCategorys" :key="`stc-${stc.id}`">
          <div>
            <cy-icon-text icon="uil:books" main-color="orange" small>{{ stc.name }}</cy-icon-text>
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
      <div
        v-else-if="contents.goSkillTree"
        class="space-y-2 border-1 border-light-2 rounded-xl p-4 bg-white overflow-y-auto pointer-events-auto"
        style="max-height: 60vh;"
      >
        <div v-for="stc in skillTreeCategorys" :key="`stc-${stc.id}`">
          <div>
            <cy-icon-text icon="uil:books" main-color="orange" small>{{ stc.name }}</cy-icon-text>
          </div>
          <div class="pl-2">
            <cy-button-inline
              v-for="st in stc.skillTrees.filter(_st => selectedSkillTrees.includes(_st))"
              :key="`st-${st.skillTreeId}`"
              icon="bx:bxs-book-bookmark"
              @click="emit('go-skill-tree', st)"
            >
              {{ st.name }}
            </cy-button-inline>
          </div>
        </div>
      </div>
      <div v-else class="space-x-2.5 flex items-center pointer-events-auto">
        <div class="border border-light-2 py-1 px-2 flex items-center space-x-1.5 bg-white whitespace-nowrap">
          <cy-icon-text icon="mdi:script-outline" small>
            {{ t('skill-simulator.skill-level-point') }}
          </cy-icon-text>
          <div class="text-sm text-light-3">
            {{ skillPointSum.level }}
          </div>
        </div>
        <div class="border border-light-2 py-1 px-2 flex items-center space-x-1.5 bg-white whitespace-nowrap">
          <cy-icon-text icon="mdi:judaism" small>
            {{ t('skill-simulator.star-gem-level-point') }}
          </cy-icon-text>
          <div class="text-sm text-water-blue">
            {{ skillPointSum.starGemLevel }}
          </div>
        </div>
      </div>
    </cy-transition>
    <div class="flex-shrink-0 flex flex-col space-y-3 pointer-events-auto">
      <cy-button-circle
        icon="ic:baseline-settings"
        main-color="orange"
        @click="toggle('contents/mainMenu', null, false)"
      />
      <cy-button-circle
        icon="carbon:location-current"
        main-color="green"
        @click="toggle('contents/goSkillTree', null, false)"
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
import Notify from '@/setup/Notify'

import { setupSkillBuildStore } from './setup'

interface Emits {
  (evt: 'go-skill-tree', skillTree: SkillTree): void;
  (evt: 'export-image'): void;
  (evt: 'export-text'): void;
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()

const skillTreeCategorys = Grimoire.Skill.skillRoot.skillTreeCategorys

const { store, skillBuilds, currentSkillBuild } = setupSkillBuildStore()
const selectedSkillTrees = computed<SkillTree[]>(() => currentSkillBuild.value?.selectedSkillTrees ?? [])

const removeCurrentSkillBuild = () => {
  store.removeCurrentSkillBuild()
  notify(t('skill-simulator.remove-build-tips'), undefined, 'skill-simulator.remove-build-tips')
}

const { contents, toggle } = ToggleService({
  contents: ['mainMenu', 'selectSkillTree', 'goSkillTree'] as const,
})

const skillPointSum = computed(() => {
  if (!currentSkillBuild.value) {
    return {
      level: 0,
      starGemLevel: 0,
    }
  }
  return currentSkillBuild.value.skillPointSum
})
</script>
