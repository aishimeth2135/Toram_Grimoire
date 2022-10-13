<template>
  <AppLayoutMain>
    <div class="w-full overflow-x-auto py-6">
      <CharacterStats v-if="mainContents.characterStats" />
      <CharacterDamage v-else-if="mainContents.damage" />
      <CharacterComboView v-else-if="mainContents.combo" />
      <component :is="currentTab" v-else />
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
            @click="
              toggle('mainContents/characterStats', null, false),
                toggle('sideContents/tabs', false)
            "
          />
          <cy-button-circle
            :selected="mainContents.damage"
            icon="ic:outline-calculate"
            color="orange"
            float
            toggle
            @click="
              toggle('mainContents/damage', null, false),
                toggle('sideContents/tabs', false)
            "
          />
          <cy-button-circle
            v-if="mainStore.devMode"
            :selected="mainContents.combo"
            icon="mdi-selection-ellipse-arrow-inside"
            color="emerald"
            float
            toggle
            @click="
              toggle('mainContents/combo', null, false),
                toggle('sideContents/tabs', false)
            "
          />
          <cy-button-circle
            :selected="sideContents.tabs"
            icon="ic:round-menu"
            color="blue"
            float
            toggle
            @click="toggle('sideContents/tabs', null, false)"
          />
        </div>
      </template>
      <template #side-buttons>
        <cy-button-circle
          :selected="sideContents.panel"
          icon="ic:outline-space-dashboard"
          color="cyan"
          float
          toggle
          @click="toggle('sideContents/panel', null, false)"
        />
      </template>
      <template #side-contents>
        <cy-transition mode="out-in">
          <AppLayoutBottomContent v-if="sideContents.tabs">
            <div style="min-width: 15rem">
              <cy-list-item
                v-for="content in tabDatas"
                :key="content.id"
                :selected="tabs[content.id]"
                @click="
                  toggle(`tabs/${content.id}`, true, false),
                    toggle('sideContents/tabs', false),
                    toggle('mainContents', false)
                "
              >
                <cy-icon-text :icon="content.icon">
                  {{ content.text }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </AppLayoutBottomContent>
          <AppLayoutBottomContent
            v-else-if="sideContents.panel"
            class="p-2.5 pl-4"
          >
            <CharacterInfoPanel @open-tab="panelOpenTab" />
          </AppLayoutBottomContent>
        </cy-transition>
      </template>
    </AppLayoutBottom>
    <CharacterBrowseEquipments
      :visible="modals.browseEquipment"
      :target-field="editEquipmentCurrentEquipmentField ?? undefined"
      @close="toggle('modals/browseEquipment')"
    />
    <CharacterAppendEquipments
      :visible="modals.appendEquipments"
      @close="toggle('modals/appendEquipments', false)"
    />
    <CharacterEquipmentBasic
      :equipment="editBasicCurrentEquipment"
      @close="editBasicCurrentEquipment = null"
    />
    <CharacterEquipmentCustomCreate
      :visible="modals.createCustomEquipment"
      @close="toggle('modals/createCustomEquipment', false)"
    />
    <CharacterEquipmentBasicEditStat
      :visible="modals.editStat"
      :equipment="editStatCurrentEquipment"
      @close="toggle('modals/editStat', false)"
    />
    <CharacterEquipmentEditCrystals
      :equipment="editCrystalCurrentEquipment"
      @close="editCrystalCurrentEquipment = null"
    />
    <CharacterComboSelectSkill
      :visible="!!currentComboSkillState.current"
      :is-lead="currentComboSkillState.current?.index === 0"
      @submit="setComboSkill"
      @close="currentComboSkillState.current = null"
    />
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'CharacterSimulator',
}
</script>

<script lang="ts" setup>
import {
  Ref,
  computed,
  nextTick,
  onMounted,
  provide,
  shallowReactive,
  shallowRef,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'

import { EquipmentField } from '@/lib/Character/Character'
import { CharacterComboSkill } from '@/lib/Character/CharacterCombo'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Skill } from '@/lib/Skill/Skill'

import AutoSave from '@/setup/AutoSave'
import ToggleService from '@/setup/ToggleService'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

import CharacterBasic from './character-basic.vue'
import CharacterBrowseEquipments from './character-browse-equipments.vue'
import CharacterComboSelectSkill from './character-combo/character-combo-select-skill.vue'
import CharacterComboView from './character-combo/index.vue'
import CharacterDamage from './character-damage/index.vue'
import CharacterEquipmentFields from './character-equipment-fields/index.vue'
import CharacterAppendEquipments from './character-equipment/character-append-equipments.vue'
import CharacterEquipmentBasicEditStat from './character-equipment/character-equipment-basic-edit-stat.vue'
import CharacterEquipmentBasic from './character-equipment/character-equipment-basic.vue'
import CharacterEquipmentCustomCreate from './character-equipment/character-equipment-custom-create.vue'
import CharacterEquipmentEditCrystals from './character-equipment/character-equipment-edit-crystals.vue'
import CharacterEquipments from './character-equipments/index.vue'
import CharacterFood from './character-food/index.vue'
import CharacterInfoPanel from './character-info-panel.vue'
import CharacterSave from './character-save/index.vue'
import CharacterSkill from './character-skill/index.vue'
import CharacterStats from './character-stats/index.vue'

import { CharacterSimulatorInjectionKey } from './injection-keys'
import { TabIds, setupCharacterFoodStore, setupCharacterStore } from './setup'

const { t } = useI18n()
const { modals, mainContents, tabs, sideContents, toggle } = ToggleService({
  modals: [
    'browseEquipment',
    'appendEquipments',
    'createCustomEquipment',
    'editStat',
  ] as const,
  mainContents: ['characterStats', 'damage', 'combo'] as const,
  tabs: [
    TabIds.Basic,
    { name: TabIds.EquipmentFields, default: true },
    TabIds.Equipments,
    TabIds.Skill,
    TabIds.Food,
    TabIds.Save,
  ] as TabIds[],
  sideContents: ['tabs', 'panel'] as const,
})

const { store, characters } = setupCharacterStore()
const { store: foodStore, foodBuilds } = setupCharacterFoodStore()

const mainStore = useMainStore()
const router = useRouter()

const tabDatas = computed(() => {
  const options = []
  // const options = [{
  //   id: TabIds.CharacterStats,
  //   icon: 'bx-bxs-user-detail',
  //   text: t('character-simulator.character-stats'),
  // }]

  // if (characters.value.some(chara => chara.name === '__DOLL_DAMAGE__')) {
  //   options.push({
  //     id: TabIds.Damage,
  //     icon: 'ic:outline-calculate',
  //     text: t('character-simulator.character-damage.title'),
  //   })
  // }

  options.push(
    {
      id: TabIds.Basic,
      icon: 'bx-bxs-face',
      text: t('character-simulator.character-basic.title'),
    },
    {
      id: TabIds.EquipmentFields,
      icon: 'gg-shape-square',
      text: t('character-simulator.equipment-info.equipment'),
    },
    {
      id: TabIds.Equipments,
      icon: 'mdi:sack',
      text: t('character-simulator.browse-equipments.action.normal'),
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
      id: TabIds.Save,
      icon: 'mdi-ghost',
      text: t('character-simulator.save-load-control.title'),
    }
  )

  return options
})

const currentTab = computed(() => {
  if (tabs[TabIds.EquipmentFields]) {
    return CharacterEquipmentFields
  }
  if (tabs[TabIds.Skill]) {
    return CharacterSkill
  }
  if (tabs[TabIds.Food]) {
    return CharacterFood
  }
  if (tabs[TabIds.Save]) {
    return CharacterSave
  }
  if (tabs[TabIds.Equipments]) {
    return CharacterEquipments
  }
  return CharacterBasic
})

const panelOpenTab = (tabId: TabIds) => {
  toggle(`tabs/${tabId}`, true, false)
  toggle('sideContents/panel', false)
  toggle('mainContents', false)
}

const editCrystalCurrentEquipment: Ref<CharacterEquipment | null> =
  shallowRef(null)
const editBasicCurrentEquipment: Ref<CharacterEquipment | null> =
  shallowRef(null)
const editStatCurrentEquipment: Ref<CharacterEquipment | null> =
  shallowRef(null)
const editEquipmentCurrentEquipmentField: Ref<EquipmentField | null> =
  shallowRef(null)
const currentComboSkillState = shallowReactive({
  current: null as CharacterComboSkill | null,
})

const editCrystal = (equip: CharacterEquipment) => {
  editCrystalCurrentEquipment.value = equip
}
const editBasic = (equip: CharacterEquipment) => {
  editBasicCurrentEquipment.value = equip
}
const editStat = (equip: CharacterEquipment) => {
  editStatCurrentEquipment.value = equip
  toggle('modals/editStat', true)
}
const editEquipmentFieldEquipment = (field: EquipmentField) => {
  toggle('modals/browseEquipment', true)
  editEquipmentCurrentEquipmentField.value = field
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

provide(CharacterSimulatorInjectionKey, {
  editCrystal,
  editBasic,
  editStat,
  editEquipmentFieldEquipment,
  appendEquipments: () => toggle('modals/appendEquipments', true),
  createCustomEquipment: () => toggle('modals/createCustomEquipment', true),
  selectComboSkill,
})

AutoSave({
  save: () => store.saveCharacterSimulator(),
  loadFirst: () => store.loadCharacterSimulator(),
})

onMounted(async () => {
  if (characters.value.length === 0) {
    store.createCharacter()
  }
  if (foodBuilds.value.length === 0 || !foodStore.currentFoodBuild) {
    foodStore.createFoodBuild()
  }
  if (mainStore.redirectPathName === 'SkillSimulator') {
    await nextTick()
    mainStore.clearRedirectPathName()
    router.replace({ name: 'SkillSimulator' })
  }
})
</script>
