<template>
  <section class="flex flex-col">
    <SkillSimulatorBuild
      v-if="currentSkillBuild"
      ref="skillBuildComponent"
      @skill-click="skillClick"
    />
    <div v-else>
      <div class="text-center mb-3">
        {{ t('common.tips.view-unknow-error-tips') }}
      </div>
      <div class="flex justify-center">
        <cy-button-border @click="store.createSkillBuild()">
          {{ t('skill-simulator.create-build') }}
        </cy-button-border>
      </div>
    </div>
    <SkillSimulatorMenuSub
      @go-skill-tree="goSkillTree"
      @export-image="toggle('modals/exportImage')"
      @export-text="toggle('modals/exportText')"
    />
    <SkillSimulatorMenu @update-menu-data="updateMenuData" />
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
  </section>
</template>

<script lang="ts">
export default {
  name: 'SkillSimulator',
}
</script>

<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Skill, SkillTree } from '@/lib/Skill/Skill'

import ToggleService from '@/setup/ToggleService'

import SkillSimulatorBuild from './skill-simulator-build.vue'
import SkillSimulatorMenu from './skill-simulator-menu.vue'
import SkillSimulatorMenuSub from './skill-simulator-menu-sub.vue'
import SkillSimulatorExportImage from './skill-simulator-export/skill-simulator-export-image.vue'
import SkillSimulatorExportText from './skill-simulator-export/skill-simulator-export-text.vue'

import { setupSkillBuildStore, MenuData } from './setup'

const { store, currentSkillBuild } = setupSkillBuildStore()
const { t } = useI18n()
const { modals, toggle } = ToggleService({
  modals: ['exportImage', 'exportText'] as const,
})

const skillBuildComponent: Ref<InstanceType<typeof SkillSimulatorBuild> | null> = ref(null)
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

const goSkillTree = (st: SkillTree) => skillBuildComponent.value?.goSkillTree(st)

onMounted(() => {
  if (currentSkillBuild.value === null) {
    store.createSkillBuild()
  }
})
</script>
