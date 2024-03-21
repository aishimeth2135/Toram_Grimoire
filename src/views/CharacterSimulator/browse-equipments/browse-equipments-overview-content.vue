<script lang="ts" setup>
import { Ref, computed } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import FloatPageContent from '@/components/app-layout/float-page/float-page-content.vue'

import BrowseEquipmentsMain from './browse-equipments-main.vue'

interface Props {
  selectedEquipment: CharacterEquipment | null
}

interface Emits {
  (evt: 'update:selected-equipment', equipment: CharacterEquipment | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const current: Ref<CharacterEquipment | null> = computed({
  get() {
    return props.selectedEquipment
  },
  set(value) {
    emit('update:selected-equipment', value)
  },
})
</script>

<template>
  <FloatPageContent>
    <BrowseEquipmentsMain v-model:selected-equipment="current" />
  </FloatPageContent>
</template>
