<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CommonEditModeButton from '../common/common-edit-mode-button.vue'
import CharacterEquipmentDetailsCrystal from './character-equipment-details-crystal.vue'
import CharacterEquipmentDetailsSelectCrystal from './character-equipment-details-select-crystal.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const isEditing = ref(props.equipment.crystals.length === 0)
</script>

<template>
  <div class="flex h-full w-full flex-col py-2">
    <template v-if="equipment.hasCrystal">
      <div class="mb-3 flex justify-end">
        <CommonEditModeButton v-model:is-editing="isEditing" />
      </div>
      <div v-if="!isEditing" class="max-w-[15rem] space-y-5">
        <CharacterEquipmentDetailsCrystal
          v-for="crystal in equipment.crystals"
          :key="crystal.id"
          :crystal="crystal"
          @remove="equipment.removeCrystal($event)"
        />
      </div>
      <CharacterEquipmentDetailsSelectCrystal v-else :equipment="equipment" />
    </template>
    <div v-else class="text-sm text-primary-60">
      {{ t('character-simulator.select-crystals.equipment-type-not-support-crystal-tips') }}
    </div>
  </div>
</template>
