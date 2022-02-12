<template>
  <article>
    <div style="min-height: 70vh">
      <component :is="currentTab" />
    </div>
    <div class="sticky bottom-2 bg-white border-1 border-solid border-light-2 rounded-2xl px-4 py-1 z-10 mx-2 mt-4 space-x-2">
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

    <CharacterBrowseEquipments
      :visible="modals.browseEquipment"
      :target-field="editEquipmentCurrentEquipmentField ?? undefined"
      @close="toggle('modals/browseEquipment')"
    />
    <CharacterEquipmentEditCrystals
      :equipment="editCrystalCurrentEquipment"
      @close="editCrystalCurrentEquipment = null"
    />
    <CharacterEquipmentBasic
      :equipment="editBasicCurrentEquipment"
      @close="editBasicCurrentEquipment = null"
    />
    <CharacterEquipmentBasicEditStat
      :equipment="editStatCurrentEquipment"
      @close="editStatCurrentEquipment = null"
    />
    <CharacterAppendEquipments
      :visible="modals.appendEquipments"
      @close="toggle('modals/appendEquipments', false)"
    />
    <CharacterEquipmentCustomCreate
      :visible="modals.createCustomEquipment"
      @close="toggle('modals/createCustomEquipment', false)"
    />
  </article>
</template>

<script lang="ts">
export default {
  name: 'CharacterSimulator',
}
</script>

<script lang="ts" setup>
import { computed, onMounted, provide, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentField } from '@/lib/Character/Character'

import ToggleService from '@/setup/ToggleService'
import AutoSave from '@/setup/AutoSave'

import CharacterBasic from './character-basic.vue'
import CharacterStats from './character-stats/index.vue'
import CharacterEquipmentFields from './character-equipment-fields/index.vue'
import CharacterSkill from './character-skill/index.vue'
import CharacterFood from './character-food/index.vue'
import CharacterEquipmentEditCrystals from './character-equipment/character-equipment-edit-crystals.vue'
import CharacterEquipmentBasic from './character-equipment/character-equipment-basic.vue'
import CharacterEquipmentBasicEditStat from './character-equipment/character-equipment-basic-edit-stat.vue'
import CharacterBrowseEquipments from './character-browse-equipments.vue'
import CharacterAppendEquipments from './character-equipment/character-append-equipments.vue'
import CharacterEquipmentCustomCreate from './character-equipment/character-equipment-custom-create.vue'
import CharacterSave from './character-save.vue'

import { CharacterSimulatorInjectionKey } from './injection-keys'
import { setupCharacterFoodStore, setupCharacterStore } from './setup'

const enum TabIds {
  Basic = 'basic',
  CharacterStats = 'characterStats',
  EquipmentFields = 'equipmentFields',
  Skill = 'skill',
  Food = 'food',
  Save = 'save',
}

const { t } = useI18n()
const { modals, tabs, toggle } = ToggleService({
  modals: ['browseEquipment', 'appendEquipments', 'createCustomEquipment'] as const,
  tabs: [
    TabIds.Basic,
    TabIds.CharacterStats,
    { name: TabIds.EquipmentFields, default: true },
    TabIds.Skill,
    TabIds.Food,
    TabIds.Save,
  ] as TabIds[],
})
const tabDatas = [{
  id: TabIds.Basic,
  icon: 'bx-bxs-face',
  text: t('character-simulator.character-basic.title'),
}, {
  id: TabIds.CharacterStats,
  icon: 'bx-bxs-user-detail',
  text: t('character-simulator.character-stats'),
}, {
  id: TabIds.EquipmentFields,
  icon: 'gg-shape-square',
  text: t('character-simulator.equipment-info.equipment'),
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
}]

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
  if (tabs[TabIds.Food]) {
    return CharacterFood
  }
  if (tabs[TabIds.Save]) {
    return CharacterSave
  }
  return CharacterBasic
})

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

const { store, characters } = setupCharacterStore()
const { store: foodStore, foodBuilds } = setupCharacterFoodStore()

const mainStore = useMainStore()
const router = useRouter()

onMounted(() => {
  if (mainStore.redirectPathName === 'SkillSimulator') {
    router.replace({ name: 'SkillSimulator' })
    mainStore.clearRedirectPathName()
  }
  if (characters.value.length === 0) {
    store.createCharacter()
  }
  if (foodBuilds.value.length === 0) {
    foodStore.createFoodBuild()
  }
})

AutoSave({
  save: () => store.saveCharacterSimulator(),
  loadFirst: () => store.loadCharacterSimulator(),
})
</script>
