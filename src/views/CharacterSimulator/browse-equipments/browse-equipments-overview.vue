<script lang="ts" setup>
import { Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import FloatPageSide from '@/components/app-layout/float-page/float-page-side.vue'
import FloatPage from '@/components/app-layout/float-page/float-page.vue'

import CharacterEquipmentDetails from '../character-equipment-details/character-equipment-details.vue'
import BrowseEquipmentsOverviewContent from './browse-equipments-overview-content.vue'

interface Props {
  visible: boolean
}
interface Emits {
  (evt: 'update:visible'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const current: Ref<CharacterEquipment | null> = ref(null)
</script>

<template>
  <FloatPage
    :title="
      t('character-simulator.browse-equipments.action.select-field-equipment')
    "
    title-icon="mdi:checkbox-blank-badge-outline"
    :visible="visible"
    columns="auto 18rem"
    @update:visible="emit('update:visible')"
  >
    <FloatPageSide>
      <CharacterEquipmentDetails :equipment="current" />
    </FloatPageSide>
    <BrowseEquipmentsOverviewContent v-model:selected-equipment="current" />
  </FloatPage>
</template>
