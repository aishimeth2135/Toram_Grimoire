<template>
  <article>
    <div style="min-height: 70vh" class="max-w-full overflow-x-auto">
      <component :is="currentTab" />
    </div>
    <!-- <div class="sticky bottom-2 mx-2 flex items-end justify-end space-x-2">
      <div class="w-full bg-white border-1 border-light-2 rounded-2xl px-4 py-0.5 z-10 mt-4 space-x-2">
        <cy-button-inline
          v-for="content in tabDatas"
          :key="content.id"
          :icon="content.icon"
          :selected="tabs[content.id]"
          class="my-1"
          @click="toggle(`tabs/${content.id}`, true, false)"
        >
          {{ content.text }}
        </cy-button-inline>
      </div>
    </div> -->
    <AppLayoutBottomMenu>
      <template #main-end>
        <div class="flex items-center space-x-2">
          <cy-button-circle
            :selected="tabs.characterStats"
            icon="bx-bxs-user-detail"
            main-color="light-3"
            shadow
            @click="toggle('tabs/characterStats', true, false)"
          />
          <cy-button-circle
            :selected="tabs.damage"
            icon="ic:outline-calculate"
            main-color="orange"
            shadow
            @click="toggle('tabs/damage', true, false)"
          />
          <cy-button-circle
            :selected="sideContents.tabs"
            icon="ic:round-menu"
            main-color="water-blue"
            shadow
            @click="toggle('sideContents/tabs', null, false)"
          />
        </div>
      </template>
      <template #side-buttons>
        <cy-button-circle
          :selected="sideContents.panel"
          icon="ic:outline-space-dashboard"
          main-color="blue-green"
          shadow
          @click="toggle('sideContents/panel', null, false)"
        />
      </template>
      <template #side-contents>
        <cy-transition type="fade" mode="out-in">
          <div v-if="sideContents.tabs" class="border border-light-2 bg-white overflow-x-auto shadow m-0.5">
            <div style="min-width: 15rem">
              <cy-list-item
                v-for="content in tabDatas"
                :key="content.id"
                :selected="tabs[content.id]"
                @click="toggle(`tabs/${content.id}`, true, false), toggle('sideContents/tabs', false)"
              >
                <cy-icon-text :icon="content.icon">
                  {{ content.text }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </div>
          <div v-else-if="sideContents.panel" class="border border-light-3 bg-white px-4 py-3 overflow-x-auto m-0.5 shadow">
            <CharacterInfoPanel @open-tab="panelOpenTab" />
          </div>
        </cy-transition>
      </template>
    </AppLayoutBottomMenu>

    <CharacterBrowseEquipments
      :visible="modals.browseEquipment"
      :target-field="editEquipmentCurrentEquipmentField ?? undefined"
      @close="toggle('modals/browseEquipment')"
    />
    <CharacterEquipmentEditCrystals
      :equipment="editCrystalCurrentEquipment"
      @close="editCrystalCurrentEquipment = null"
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
      :equipment="editStatCurrentEquipment"
      @close="editStatCurrentEquipment = null"
    />
  </article>
</template>

<script lang="ts">
export default {
  name: 'CharacterSimulator',
}
</script>

<script lang="ts" setup>
import { computed, onMounted, provide, Ref, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentField } from '@/lib/Character/Character'

import ToggleService from '@/setup/ToggleService'
import AutoSave from '@/setup/AutoSave'

import AppLayoutBottomMenu from '@/components/app-layout/app-layout-bottom-menu.vue'

import CharacterBasic from './character-basic.vue'
import CharacterStats from './character-stats/index.vue'
import CharacterEquipmentFields from './character-equipment-fields/index.vue'
import CharacterSkill from './character-skill/index.vue'
import CharacterDamage from './character-damage/index.vue'
import CharacterFood from './character-food/index.vue'
import CharacterEquipmentEditCrystals from './character-equipment/character-equipment-edit-crystals.vue'
import CharacterEquipmentBasic from './character-equipment/character-equipment-basic.vue'
import CharacterEquipmentBasicEditStat from './character-equipment/character-equipment-basic-edit-stat.vue'
import CharacterBrowseEquipments from './character-browse-equipments.vue'
import CharacterAppendEquipments from './character-equipment/character-append-equipments.vue'
import CharacterEquipmentCustomCreate from './character-equipment/character-equipment-custom-create.vue'
import CharacterSave from './character-save/index.vue'
import CharacterInfoPanel from './character-info-panel.vue'
import CharacterEquipments from './character-equipments/index.vue'

import { CharacterSimulatorInjectionKey } from './injection-keys'
import { setupCharacterFoodStore, setupCharacterStore, TabIds } from './setup'

const { t } = useI18n()
const { modals, tabs, sideContents, toggle } = ToggleService({
  modals: ['browseEquipment', 'appendEquipments', 'createCustomEquipment'] as const,
  tabs: [
    TabIds.CharacterStats,
    TabIds.Damage,
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

  options.push({
    id: TabIds.Basic,
    icon: 'bx-bxs-face',
    text: t('character-simulator.character-basic.title'),
  }, {
    id: TabIds.EquipmentFields,
    icon: 'gg-shape-square',
    text: t('character-simulator.equipment-info.equipment'),
  }, {
    id: TabIds.Equipments,
    icon: 'mdi:sack',
    text: t('character-simulator.browse-equipments.action.normal'),
  }, {
    id: TabIds.Skill,
    icon: 'ant-design:build-outlined',
    text: t('character-simulator.skill-build.title'),
  }, {
    id: TabIds.Food,
    icon: 'mdi-food-apple',
    text: t('character-simulator.food-build.title'),
  }, {
    id: TabIds.Save,
    icon: 'mdi-ghost',
    text: t('character-simulator.save-load-control.title'),
  })

  return options
})

const currentTab = computed(() => {
  if (tabs[TabIds.CharacterStats]) {
    return CharacterStats
  }
  if (tabs[TabIds.EquipmentFields]) {
    return CharacterEquipmentFields
  }
  if (tabs[TabIds.Skill]) {
    return CharacterSkill
  }
  if (tabs[TabIds.Damage]) {
    return CharacterDamage
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
}

const editCrystalCurrentEquipment: Ref<CharacterEquipment | null> = ref(null)
const editBasicCurrentEquipment: Ref<CharacterEquipment | null> = ref(null)
const editStatCurrentEquipment: Ref<CharacterEquipment | null> = ref(null)
const editEquipmentCurrentEquipmentField: Ref<EquipmentField | null> = ref(null)

const editCrystal = (equip: CharacterEquipment) => {
  editCrystalCurrentEquipment.value = equip
}
const editBasic = (equip: CharacterEquipment) => {
  editBasicCurrentEquipment.value = equip
}
const editStat = (equip: CharacterEquipment) => {
  editStatCurrentEquipment.value = equip
}
const editEquipmentFieldEquipment = (field: EquipmentField) => {
  toggle('modals/browseEquipment', true)
  editEquipmentCurrentEquipmentField.value = field
}

provide(CharacterSimulatorInjectionKey, {
  editCrystal,
  editBasic,
  editStat,
  editEquipmentFieldEquipment,
  appendEquipments: () => toggle('modals/appendEquipments', true),
  createCustomEquipment: () => toggle('modals/createCustomEquipment', true),
})

AutoSave({
  save: () => store.saveCharacterSimulator(),
  loadFirst: () => store.loadCharacterSimulator(),
})

onMounted(async () => {
  if (characters.value.length === 0) {
    store.createCharacter()
  }
  if (foodBuilds.value.length === 0) {
    foodStore.createFoodBuild()
  }
  if (mainStore.redirectPathName === 'SkillSimulator') {
    await nextTick()
    mainStore.clearRedirectPathName()
    router.replace({ name: 'SkillSimulator' })
  }
})
</script>
