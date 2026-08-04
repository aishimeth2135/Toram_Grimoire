<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import FloatPage from '@/components/app-layout/float-page/float-page.vue'

import BrowseEquipmentEquippedItems from '../browse-equipments/browse-equipment-equipped-items.vue'
import BrowseEquipmentsMain from '../browse-equipments/browse-equipments-main.vue'
import CharacterEquipmentDetailsEditBasic from './character-equipment-details-edit-basic.vue'
import CharacterEquipmentDetailsEditCrystal from './character-equipment-details-edit-crystal.vue'
import CharacterEquipmentDetailsEditStat from './character-equipment-details-edit-stat.vue'
import CharacterEquipmentDetailsEditTrait from './character-equipment-details-edit-trait.vue'
import CharacterEquipmentDetails from './character-equipment-details.vue'

import { CharacterEquipmentEditModes } from './setup'

interface Props {
  initMode?: CharacterEquipmentEditModes | null
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const equipment = defineModel<CharacterEquipment | null>('equipment', {
  required: true,
})

const { t } = useI18n()

const currentMode = ref<CharacterEquipmentEditModes | null>(
  props.initMode ?? CharacterEquipmentEditModes.Basic
)

watch(
  () => props.initMode,
  newValue => {
    if (newValue) {
      currentMode.value = newValue
    }
  }
)

const updateCurrentMode = (value: CharacterEquipmentEditModes | null) => {
  currentMode.value = value
}

const enum BrowseMode {
  Equipped,
  All,
}

const browseMode = ref(BrowseMode.Equipped)
</script>

<template>
  <FloatPage
    :visible="!!equipment"
    :title="t('character-simulator.equipment-basic-editor.title')"
    title-icon="ic-round-edit"
    @update:visible="emit('close')"
  >
    <div class="wd-lg:flex h-full w-full overflow-y-auto px-4 py-4">
      <div class="wd:flex wd-lg:h-full shrink-0 py-2">
        <CharacterEquipmentDetails
          :current-edit-mode="currentMode"
          :equipment="equipment"
          @update:current-edit-mode="updateCurrentMode"
        />
        <div
          v-if="equipment"
          class="wd:mx-4 wd:my-0 wd:h-full wd:w-[22rem] my-6 w-full max-w-[22rem] overflow-y-auto px-4"
        >
          <CharacterEquipmentDetailsEditBasic
            v-if="currentMode === CharacterEquipmentEditModes.Basic"
            :equipment="equipment"
          />
          <CharacterEquipmentDetailsEditStat
            v-if="currentMode === CharacterEquipmentEditModes.Stat"
            :equipment="equipment"
          />
          <CharacterEquipmentDetailsEditCrystal
            v-if="currentMode === CharacterEquipmentEditModes.Crystal"
            :equipment="equipment"
          />
          <CharacterEquipmentDetailsEditTrait
            v-if="currentMode === CharacterEquipmentEditModes.Trait"
            :equipment="equipment"
          />
        </div>
      </div>
      <div
        class="border-primary-10 wd:grow wd-lg:h-full flex max-h-full max-w-[45.25rem] flex-col rounded-sm border bg-white pb-2"
      >
        <div class="text-gray-40 px-3 pt-2 text-sm">
          {{ t('character-simulator.equipment-basic-editor.select-equipment-to-edit-tips') }}
        </div>
        <cy-tabs v-model="browseMode" class="mb-4 px-2">
          <cy-tab :value="BrowseMode.Equipped">
            <cy-icon icon="mdi:done-outline" />
          </cy-tab>
          <cy-tab :value="BrowseMode.All">
            <cy-icon icon="mdi:format-list-bulleted" />
          </cy-tab>
        </cy-tabs>
        <div
          v-if="browseMode === BrowseMode.Equipped"
          class="border-primary-10 mx-2 grow overflow-y-auto rounded-sm border"
        >
          <BrowseEquipmentEquippedItems v-model:selected-equipment="equipment" />
        </div>
        <BrowseEquipmentsMain
          v-else-if="browseMode === BrowseMode.All"
          v-model:selected-equipment="equipment"
          class="min-h-0 min-w-0 grow"
        />
      </div>
    </div>
  </FloatPage>
</template>
