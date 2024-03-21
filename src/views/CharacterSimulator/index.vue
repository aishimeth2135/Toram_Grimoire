<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <AppLayoutMain>
    <div class="w-full overflow-x-auto py-2">
      <CharacterStats
        :visible="mainContents.characterStats"
        @close="toggle('mainContents/characterStats', false)"
      />
      <CharacterDamage
        :visible="mainContents.damage"
        @close="toggle('mainContents/damage', false)"
      />
      <CharacterComboView v-if="mainContents.combo" />
      <div v-else>
        <cy-tabs v-model="currentTab" class="mb-4">
          <cy-tab v-for="tab in tabDatas" :key="tab.id" :value="tab.id">
            {{ tab.text }}
          </cy-tab>
        </cy-tabs>
        <CharacterEquipmentFields
          v-show="currentTab === TabIds.EquipmentFields"
        />
        <CharacterSkill v-if="currentTab === TabIds.Skill" />
        <CharacterFood v-else-if="currentTab === TabIds.Food" />
        <CharacterRegistlet v-else-if="currentTab === TabIds.Registlet" />
        <CharacterPotion v-else-if="currentTab === TabIds.Potion" />
        <CharacterSave v-else-if="currentTab === TabIds.Save" />
        <CharacterDashboard
          v-else-if="currentTab === TabIds.Dashboard && currentCharacter"
          :character="currentCharacter"
        />
        <CharacterBasic v-else-if="currentTab === TabIds.Basic" />
      </div>
    </div>
    <AppLayoutBottom>
      <template #main-end>
        <div class="flex items-center space-x-2">
          <cy-button-circle
            :selected="mainContents.characterStats"
            icon="bx-bxs-user-detail"
            color="bright"
            float
            toggle
            @click="toggle('mainContents/characterStats', null, false)"
          />
          <cy-button-circle
            :selected="mainContents.damage"
            icon="ic:outline-calculate"
            color="orange"
            float
            toggle
            @click="toggle('mainContents/damage', null, false)"
          />
          <cy-button-circle
            v-if="mainStore.devMode"
            :selected="mainContents.combo"
            icon="mdi-selection-ellipse-arrow-inside"
            color="emerald"
            float
            toggle
            @click="toggle('mainContents/combo', null, false)"
          />
        </div>
      </template>
    </AppLayoutBottom>
    <CharacterEquipmentDetailsFloat
      :equipment="editedCurrentEquipment"
      :init-mode="editedEquipmentEditMode"
      @close="editedCurrentEquipment = null"
    />
    <CharacterComboSelectSkill
      :visible="!!currentComboSkillState.current"
      :is-lead="currentComboSkillState.current?.index === 0"
      @submit="setComboSkill"
      @close="currentComboSkillState.current = null"
    />
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import {
  Ref,
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  shallowReactive,
  shallowRef,
} from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'

import { ViewNames } from '@/shared/consts/view'
import AutoSave from '@/shared/setup/AutoSave'
import { registViewStatesCleaning } from '@/shared/setup/State'
import ToggleService from '@/shared/setup/ToggleService'

import { CharacterComboSkill } from '@/lib/Character/CharacterCombo'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Skill } from '@/lib/Skill/Skill'

import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import CharacterBasic from './character-basic.vue'
import CharacterComboSelectSkill from './character-combo/character-combo-select-skill.vue'
import CharacterComboView from './character-combo/index.vue'
import CharacterDamage from './character-damage/index.vue'
import CharacterDashboard from './character-dashboard/character-dashboard.vue'
import CharacterEquipmentDetailsFloat from './character-equipment-details/character-equipment-details-float.vue'
import CharacterEquipmentFields from './character-equipment-fields/character-equipment-fields.vue'
import CharacterFood from './character-food/index.vue'
import CharacterPotion from './character-potion/index.vue'
import CharacterRegistlet from './character-registlet/index.vue'
import CharacterSave from './character-save/index.vue'
import CharacterSkill from './character-skill/index.vue'
import CharacterStats from './character-stats/index.vue'

import { CharacterEquipmentEditModes } from './character-equipment-details/setup'
import { CharacterSimulatorInjectionKey } from './injection-keys'
import {
  TabIds,
  setupCharacterFoodStore,
  setupCharacterPotionStore,
  setupCharacterRegistletStore,
  setupCharacterSkillBuildStore,
  setupCharacterStore,
} from './setup'

defineOptions({
  name: 'CharacterSimulator',
})

const { t } = useI18n()
const { mainContents, toggle } = ToggleService({
  mainContents: ['characterStats', 'damage', 'combo'] as const,
})

const { store, characters, currentCharacter } = setupCharacterStore()
const { store: skillBuildStore, skillBuilds } = setupCharacterSkillBuildStore()
const { store: foodStore, foodBuilds } = setupCharacterFoodStore()
const { store: registletStore, registletBuilds } =
  setupCharacterRegistletStore()
const { store: potionStore, potionBuilds } = setupCharacterPotionStore()

const mainStore = useMainStore()
const router = useRouter()

const tabDatas = computed(() => {
  const options = []

  options.push(
    {
      id: TabIds.Basic,
      icon: 'bx-bxs-face',
      text: t('character-simulator.character-basic.title'),
    },
    {
      id: TabIds.Dashboard,
      icon: 'bx-bxs-face',
      text: t('character-simulator.character-dashboard.title'),
    },
    {
      id: TabIds.EquipmentFields,
      icon: 'gg-shape-square',
      text: t('character-simulator.equipment-info.equipment'),
    },
    {
      id: TabIds.Skill,
      icon: 'ant-design:build-outlined',
      text: t('character-simulator.skill-build.title'),
    },
    {
      id: TabIds.Food,
      icon: 'mdi-food-apple',
      text: t('character-simulator.food-build.title'),
    },
    {
      id: TabIds.Registlet,
      icon: 'game-icons:beveled-star',
      text: t('character-simulator.registlet-build.title'),
    },
    {
      id: TabIds.Potion,
      icon: 'mdi:bottle-tonic-outline',
      text: t('character-simulator.potion-build.title'),
    },
    {
      id: TabIds.Save,
      icon: 'mdi-ghost',
      text: t('character-simulator.save-load-control.title'),
    }
  )

  return options
})

const currentTab = ref(TabIds.EquipmentFields)
const editedCurrentEquipment: Ref<CharacterEquipment | null> = shallowRef(null)
const editedEquipmentEditMode: Ref<CharacterEquipmentEditModes | null> =
  shallowRef(null)
const currentComboSkillState = shallowReactive({
  current: null as CharacterComboSkill | null,
})

const editEquipment = (
  equip: CharacterEquipment,
  initMode?: CharacterEquipmentEditModes
) => {
  editedCurrentEquipment.value = equip
  editedEquipmentEditMode.value = initMode ?? null
}
const selectComboSkill = (comboSkill: CharacterComboSkill) => {
  currentComboSkillState.current = comboSkill
}

const setComboSkill = (skill: Skill) => {
  if (!currentComboSkillState.current) {
    return
  }
  currentComboSkillState.current.setSkill(skill)
  currentComboSkillState.current = null
}

const characterSimulatorOptions = reactive({
  characterStatsDetailPreviewVisible: false,
})

provide(CharacterSimulatorInjectionKey, {
  editEquipment,
  selectComboSkill,
  setCurrentTab: tabId => {
    currentTab.value = tabId
  },
  characterSimulatorOptions,
})

AutoSave({
  save: () => store.saveCharacterSimulator(),
  loadFirst: () => store.loadCharacterSimulator(),
})

// init
if (characters.value.length === 0) {
  store.createCharacter()
}
if (skillBuilds.value.length === 0) {
  skillBuildStore.createSkillBuild()
}
if (foodBuilds.value.length === 0 || !foodStore.currentFoodBuild) {
  foodStore.createFoodBuild()
}
if (
  registletBuilds.value.length === 0 ||
  !registletStore.currentRegistletBuild
) {
  registletStore.createRegistletBuild()
}
if (potionBuilds.value.length === 0 || !potionStore.currentPotionBuild) {
  potionStore.createPotionBuild()
}

onMounted(async () => {
  if (mainStore.redirectPathName === 'SkillSimulator') {
    await nextTick()
    mainStore.clearRedirectPathName()
    router.replace({ name: 'SkillSimulator' })
  }
})

registViewStatesCleaning(ViewNames.CharacterSimulator)
</script>
