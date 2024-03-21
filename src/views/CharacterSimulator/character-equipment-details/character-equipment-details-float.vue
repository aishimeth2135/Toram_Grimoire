<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import FloatPageSide from '@/components/app-layout/float-page/float-page-side.vue'
import FloatPage from '@/components/app-layout/float-page/float-page.vue'

import CharacterEquipmentDetailsEditBasic from './character-equipment-details-edit-basic.vue'
import CharacterEquipmentDetailsEditCrystal from './character-equipment-details-edit-crystal.vue'
import CharacterEquipmentDetailsEditStat from './character-equipment-details-edit-stat.vue'
import CharacterEquipmentDetails from './character-equipment-details.vue'

import { CharacterEquipmentEditModes } from './setup'

interface Props {
  equipment: CharacterEquipment | null
  initMode?: CharacterEquipmentEditModes | null
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

const updateCurrentMode = (
  value: CharacterEquipmentEditModes | null,
  switchToContent: () => void
) => {
  currentMode.value = value
  if (value) {
    switchToContent()
  }
}
</script>

<template>
  <FloatPage
    v-slot="{ switchToContent }"
    :visible="!!equipment"
    :title="t('character-simulator.equipment-basic-editor.title')"
    title-icon="ic-round-edit"
    columns="17rem 17rem"
    @update:visible="emit('close')"
  >
    <FloatPageSide v-if="equipment">
      <CharacterEquipmentDetails
        :current-edit-mode="currentMode"
        :equipment="equipment"
        @update:current-edit-mode="updateCurrentMode($event, switchToContent)"
      />
    </FloatPageSide>
    <template v-if="equipment">
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
    </template>
  </FloatPage>
</template>
