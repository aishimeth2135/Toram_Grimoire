<template>
  <div class="px-2">
    <div
      v-if="equipment.isWeapon() || equipment.isArmor()"
      class="flex items-center my-2 rounded-2xl border-1 border-solid border-light py-1 px-3"
    >
      <template v-if="equipment.isWeapon()">
        <cy-icon-text icon="mdi-sword">
          ATK
        </cy-icon-text>
        <span class="ml-2 text-purple">
          {{ equipment.atk }}
          <span
            v-if="(equipment instanceof MainWeapon) && equipment.refining > 0"
            class="ml-1 text-water-blue"
          >
            +{{ equipment.refiningAdditionAmount! }}</span>
        </span>
        <span class="ml-auto">{{ equipment.stability }}%</span>
      </template>
      <template v-else>
        <cy-icon-text icon="mdi-shield">
          DEF
        </cy-icon-text>
        <span class="ml-2 text-purple">{{ equipment.def }}</span>
      </template>
    </div>
    <div class="mt-1 pl-1" :class="{ 'opacity-50': statsDisabled }">
      <ShowStat
        v-for="stat in equipment.stats"
        :key="stat.statId"
        :stat="stat"
        :negative-value="stat.value < 0"
      />
    </div>
    <div
      v-if="equipment.hasCrystal && equipment.crystals!.length > 0"
      class="border-t border-solid border-light mt-2 pt-1"
      :class="{ 'opacity-50': statsDisabled }"
    >
      <cy-icon-text
        v-for="crystal in equipment.crystals"
        :key="crystal.id"
        class="mr-3 my-1"
        :icon="crystal.crystalIconPath"
        icon-src="image"
      >
        {{ crystal.name }}
      </cy-icon-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CharacterEquipment, MainWeapon } from '@/lib/Character/CharacterEquipment'

import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipment: CharacterEquipment;
  statsDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  statsDisabled: false,
})
</script>
