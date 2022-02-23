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
    <SkillSimulatorMenuSub @go-skill-tree="goSkillTree" />
    <SkillSimulatorMenu @update-menu-data="updateMenuData" />
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

import SkillSimulatorBuild from './skill-simulator-build.vue'
import SkillSimulatorMenu from './skill-simulator-menu.vue'
import SkillSimulatorMenuSub from './skill-simulator-menu-sub.vue'

import { setupSkillBuildStore, MenuData } from './setup'

const { store, currentSkillBuild } = setupSkillBuildStore()
const { t } = useI18n()

const skillBuildComponent: Ref<InstanceType<typeof SkillSimulatorBuild> | null> = ref(null)
const menuData = ref<MenuData>({
  levelUnit: 5,
  mode: 'skill',
})

const updateMenuData = (data: MenuData) => {
  menuData.value = data
}

const skillClick = (skill: Skill) => {
  currentSkillBuild.value?.addSkillLevel(skill, menuData.value.levelUnit)
}

const goSkillTree = (st: SkillTree) => skillBuildComponent.value?.goSkillTree(st)

onMounted(() => {
  if (currentSkillBuild.value === null) {
    store.createSkillBuild()
  }
})
</script>
