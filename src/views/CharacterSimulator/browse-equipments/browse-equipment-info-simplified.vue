<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <div class="pr-4 pb-3 pl-6">
    <div>
      <ShowStat v-for="stat in equipment.stats" :key="stat.statId" :stat="stat" />
    </div>
    <div v-if="equipment.crystals.length > 0" class="mt-3 flex flex-wrap items-center">
      <div v-for="crystal in equipment.crystals" :key="crystal.id" class="mr-3 flex items-center">
        <cy-icon :icon="crystal.crystalIconPath" />
        <span class="ml-1 text-sm text-cyan-60">
          {{ crystal.name }}
        </span>
      </div>
    </div>
  </div>
</template>
