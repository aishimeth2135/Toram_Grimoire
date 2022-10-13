<template>
  <div
    v-if="
      equipment.is(EquipmentKinds.Weapon) || equipment.is(EquipmentKinds.Armor)
    "
  >
    <cy-input-counter
      v-if="equipment.is(EquipmentKinds.Weapon)"
      v-model:value="
        equipment.basicValue /* eslint-disable-line vue/no-mutating-props */
      "
      :range="baseValueRanges"
    >
      <template #title>
        <cy-icon-text icon="mdi-sword"> ATK </cy-icon-text>
      </template>
    </cy-input-counter>
    <cy-input-counter
      v-if="equipment.is(EquipmentKinds.Armor)"
      v-model:value="
        equipment.basicValue /* eslint-disable-line vue/no-mutating-props */
      "
      :range="baseValueRanges"
    >
      <template #title>
        <cy-icon-text icon="mdi:shield-outline"> DEF </cy-icon-text>
      </template>
    </cy-input-counter>
  </div>
</template>

<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment/enums'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()

const baseValueRanges = [0, 999]
</script>
