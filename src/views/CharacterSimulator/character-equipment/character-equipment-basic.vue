<template>
  <cy-modal :visible="!!equipment" footer @close="emit('close')">
    <CharacterEquipmentBasicEditor :equipment="equipment" />
  </cy-modal>
</template>

<script lang="ts" setup>
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
</script>
