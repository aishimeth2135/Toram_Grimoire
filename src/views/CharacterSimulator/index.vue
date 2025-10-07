<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <AppLayoutMain>
    <div class="flex w-full grow flex-col overflow-x-auto">
      <CharacterStats
        :visible="characterStatsVisible"
        @close="toggleCharacterStatsVisible(false)"
      />
      <CharacterDamage :visible="damageVisible" @close="toggleDamageVisible(false)" />
      <div class="flex grow flex-col">
        <AppLayoutTopSticky>
          <cy-tabs :model-value="route.name" class="mb-4 bg-white">
            <router-link
              v-for="tab in tabDatas"
              :key="tab.path"
              v-slot="{ navigate }"
              :to="{ name: tab.path }"
              custom
            >
              <cy-tab :value="tab.path" @click="navigate">
                {{ tab.text }}
              </cy-tab>
            </router-link>
          </cy-tabs>
        </AppLayoutTopSticky>
        <router-view />
      </div>
    </div>
    <AppLayoutBottom>
      <template v-if="route.name === CharacterSimulatorRouteNames.Skill" #main-custom>
        <CharacterSkillBottomMenu />
      </template>
      <template #side-buttons>
        <cy-button-circle icon="mdi:arrow-top" color="blue" float @click="scrollToPageTop" />
        <cy-button-circle
          :selected="damageVisible"
          icon="ic:outline-calculate"
          color="orange"
          float
          toggle
          @click="toggleMainContents(false).and(toggleDamageVisible)"
        />
        <cy-button-circle
          :selected="characterStatsVisible"
          icon="bx-bxs-user-detail"
          color="bright"
          float
          toggle
          @click="toggleMainContents(false).and(toggleCharacterStatsVisible)"
        />
        <!-- <cy-button-circle
          v-if="mainStore.devMode"
          :selected="mainContents.combo"
          icon="mdi-selection-ellipse-arrow-inside"
          color="emerald"
          float
          toggle
          @click="toggle('mainContents/combo', null, false)"
        /> -->
      </template>
    </AppLayoutBottom>
    <CharacterEquipmentDetailsFloat
      v-model:equipment="editedCurrentEquipment"
      :init-mode="editedEquipmentEditMode"
      @close="editedCurrentEquipment = null"
    />
    <!-- <CharacterComboSelectSkill
      :visible="!!currentComboSkillState.current"
      :is-lead="currentComboSkillState.current?.index === 0"
      @submit="setComboSkill"
      @close="currentComboSkillState.current = null"
    /> -->
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterFoodStore } from '@/stores/views/character/food-build'
import { useCharacterPotionBuildStore } from '@/stores/views/character/potion-build'
import { useCharacterRegistletBuildStore } from '@/stores/views/character/registlet-build'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { ViewNames } from '@/shared/consts/view'
import { useAppPageActions } from '@/shared/setup/App'
import AutoSave from '@/shared/setup/AutoSave'
import { registViewStatesCleaning, useToggle, useToggleGroup } from '@/shared/setup/State'

import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import AppLayoutTopSticky from '@/components/app-layout/app-layout-top-sticky.vue'
import { CharacterSimulatorRouteNames } from '@/router/Character'

import CharacterDamage from './character-damage/index.vue'
import CharacterEquipmentDetailsFloat from './character-equipment-details/character-equipment-details-float.vue'
import CharacterSkillBottomMenu from './character-skill/character-skill-bottom-menu.vue'
import CharacterStats from './character-stats/index.vue'

import { useCharacterSimulatorState } from './setup'

defineOptions({
  name: 'CharacterSimulator',
})

const { t } = useI18n()

const characterStatsVisible = ref(false)
const toggleCharacterStatsVisible = useToggle(characterStatsVisible)
const damageVisible = ref(false)
const toggleDamageVisible = useToggle(damageVisible)
// const comboVisible = ref(false)

const toggleMainContents = useToggleGroup([toggleCharacterStatsVisible, toggleDamageVisible])

const { scrollToPageTop } = useAppPageActions()

const characterStore = useCharacterStore()
const skillBuildStore = useCharacterSkillBuildStore()
const foodStore = useCharacterFoodStore()
const registletStore = useCharacterRegistletBuildStore()
const potionStore = useCharacterPotionBuildStore()
const { skillBuilds } = storeToRefs(skillBuildStore)
const { registletBuilds } = storeToRefs(registletStore)
const { potionBuilds } = storeToRefs(potionStore)

const route = useRoute()

const { editedCurrentEquipment, editedEquipmentEditMode } = useCharacterSimulatorState()

const tabDatas = computed(() => {
  const options = []

  options.push(
    {
      path: CharacterSimulatorRouteNames.Basic,
      icon: 'bx-bxs-face',
      text: t('character-simulator.character-basic.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Dashboard,
      icon: 'bx-bxs-face',
      text: t('character-simulator.character-dashboard.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Equipment,
      icon: 'gg-shape-square',
      text: t('character-simulator.equipment-info.equipment'),
    },
    {
      path: CharacterSimulatorRouteNames.Skill,
      icon: 'ant-design:build-outlined',
      text: t('character-simulator.skill-build.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Food,
      icon: 'mdi-food-apple',
      text: t('character-simulator.food-build.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Registlet,
      icon: 'game-icons:beveled-star',
      text: t('character-simulator.registlet-build.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Potion,
      icon: 'mdi:bottle-tonic-outline',
      text: t('character-simulator.potion-build.title'),
    },
    {
      path: CharacterSimulatorRouteNames.Save,
      icon: 'mdi-ghost',
      text: t('character-simulator.save-load-control.title'),
    }
  )

  return options
})

// const setComboSkill = (skill: Skill) => {
//   if (!currentComboSkillState.current) {
//     return
//   }
//   currentComboSkillState.current.setSkill(skill)
//   currentComboSkillState.current = null
// }

AutoSave({
  save: () => {
    if (!characterStore.autoSaveDisabled) {
      characterStore.saveCharacterSimulator()
    }
  },
  loadFirst: () => characterStore.loadCharacterSimulator(),
})

// init
if (skillBuilds.value.length === 0) {
  skillBuildStore.createSkillBuild()
}
if (foodStore.foodBuilds.length === 0 || !foodStore.currentFoodBuild) {
  foodStore.createFoodBuild()
}
if (registletBuilds.value.length === 0 || !registletStore.currentRegistletBuild) {
  registletStore.createRegistletBuild()
}
if (potionBuilds.value.length === 0 || !potionStore.currentPotionBuild) {
  potionStore.createPotionBuild()
}

// create the character at the end to make all builds bound automatically
if (characterStore.characters.length === 0) {
  characterStore.createCharacter()
}

registViewStatesCleaning(ViewNames.CharacterSimulator)
</script>
