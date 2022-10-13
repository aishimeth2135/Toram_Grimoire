<template>
  <cy-modal
    :visible="!!equipment"
    :title="t('character-simulator.equipment-basic-editor.title')"
    title-icon="ic-round-edit"
    footer
    @close="emit('close')"
  >
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
  equipment: CharacterEquipment | null
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
</script>
