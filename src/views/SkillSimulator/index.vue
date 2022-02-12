<template>
  <section class="flex flex-col">
    <SkillSimulatorBuild @skill-click="skillClick" />
    <SkillSimulatorMenuSub />
    <SkillSimulatorMenu @update-menu-data="updateMenuData" />
  </section>
</template>

<script lang="ts">
export default {
  name: 'SkillSimulator',
}
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { Skill } from '@/lib/Skill/Skill'

import SkillSimulatorBuild from './skill-simulator-build.vue'
import SkillSimulatorMenu from './skill-simulator-menu.vue'
import SkillSimulatorMenuSub from './skill-simulator-menu-sub.vue'

import { setupSkillBuildStore, MenuData } from './setup'

const { store, currentSkillBuild } = setupSkillBuildStore()

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

onMounted(() => {
  if (currentSkillBuild.value === null) {
    store.createSkillBuild()
  }
})
</script>
