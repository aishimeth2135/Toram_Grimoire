<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { Items } from '@/lib/common/Items'

import CharacterEquipmentsLabelSetting from '../character-equipments-manage/character-equipments-label-setting.vue'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <CharacterEquipmentsLabelSetting
    :selected-labels="equipment.labels"
    @label-click="Items.toggle(equipment.labels, $event)"
  />
</template>
