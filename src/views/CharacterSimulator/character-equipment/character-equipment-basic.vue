<template>
  <cy-modal :visible="!!equipment" footer @close="emit('close')">
    <template #title>
      <cy-icon-text icon="ic-round-edit" text-color="purple">
        {{ t('character-simulator.equipment-basic-editor.title') }}
      </cy-icon-text>
    </template>
    <template #default>
      <CharacterEquipmentBasicEditor :equipment="equipment" />
    </template>
  </cy-modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentBasicEditor from './character-equipment-basic-editor.vue'

interface Props {
  equipment: CharacterEquipment | null;
}
interface Emits {
  (evt: 'close'): void;
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>
