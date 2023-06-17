<template>
  <AppLayoutMain>
    <SkillSimulatorBuild
      v-if="currentSkillBuild"
      ref="skillBuildComponent"
      @skill-click="skillClick"
    />
    <div v-else>
      <div class="mb-3 text-center">
        {{ t('common.tips.view-unknown-error-tips') }}
      </div>
      <div class="flex justify-center">
        <cy-button-action
          @click="
            characterStore.setCharacterSkillBuild(store.createSkillBuild())
          "
        >
          {{ t('skill-simulator.create-build') }}
        </cy-button-action>
      </div>
    </div>
    <SkillSimulatorMenu
      @update-menu-data="updateMenuData"
      @go-skill-tree="goSkillTree"
      @export-image="toggle('modals/exportImage')"
      @export-text="toggle('modals/exportText')"
    />
    <SkillSimulatorExportImage
      :visible="modals.exportImage"
      :skill-build="currentSkillBuild"
      @close="toggle('modals/exportImage', false)"
    />
    <SkillSimulatorExportText
      :visible="modals.exportText"
      :skill-build="currentSkillBuild"
      @close="toggle('modals/exportText', false)"
    />
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'SkillSimulator',
}
</script>

<script lang="ts" setup>
import { Ref, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { Skill, SkillTree } from '@/lib/Skill/Skill'

import ToggleService from '@/shared/setup/ToggleService'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import SkillSimulatorBuild from './skill-simulator-build.vue'
import SkillSimulatorExportImage from './skill-simulator-export/skill-simulator-export-image.vue'
import SkillSimulatorExportText from './skill-simulator-export/skill-simulator-export-text.vue'
import SkillSimulatorMenu from './skill-simulator-menu.vue'

import { MenuData, setupSkillBuildStore } from './setup'

const { store, currentSkillBuild } = setupSkillBuildStore()
const { t } = useI18n()
const { modals, toggle } = ToggleService({
  modals: ['exportImage', 'exportText'] as const,
})

const characterStore = useCharacterStore()

const skillBuildComponent: Ref<InstanceType<
  typeof SkillSimulatorBuild
> | null> = ref(null)
const menuData = ref<MenuData>({
  levelUnit: 5,
  mode: 'skill',
})

const updateMenuData = (data: MenuData) => {
  menuData.value = data
}

const skillClick = (skill: Skill) => {
  if (menuData.value.mode === 'skill') {
    currentSkillBuild.value?.addSkillLevel(skill, menuData.value.levelUnit)
  } else if (menuData.value.mode === 'star-gem') {
    currentSkillBuild.value?.addStarGemLevel(skill, menuData.value.levelUnit)
  }
}

const goSkillTree = (st: SkillTree) =>
  skillBuildComponent.value?.goSkillTree(st)

onMounted(() => {
  if (currentSkillBuild.value === null) {
    store.createSkillBuild()
  }
})
</script>
