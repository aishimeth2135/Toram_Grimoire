<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import FloatPageContent from '@/components/app-layout/float-page/float-page-content.vue'
import FloatPageMain from '@/components/app-layout/float-page/float-page-main.vue'
import FloatPageSub from '@/components/app-layout/float-page/float-page-sub.vue'

import CharacterEquipmentDetailsCrystal from './character-equipment-details-crystal.vue'
import CharacterEquipmentDetailsSelectCrystal from './character-equipment-details-select-crystal.vue'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <FloatPageContent>
    <FloatPageMain>
      <div class="max-w-[15rem] space-y-5">
        <CharacterEquipmentDetailsCrystal
          v-for="crystal in equipment.crystals"
          :key="crystal.id"
          :crystal="crystal"
        />
      </div>
    </FloatPageMain>
    <FloatPageSub>
      <CharacterEquipmentDetailsSelectCrystal :equipment="equipment" />
    </FloatPageSub>
  </FloatPageContent>
</template>
