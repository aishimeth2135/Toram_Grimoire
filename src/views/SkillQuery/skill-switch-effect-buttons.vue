<template>
  <div class="flex justify-center">
    <div class="flex flex-col">
      <div v-for="equipment in allEquipments" :key="equipment.id">
        <SkillEquipmentButton
          :equipments="[equipment.value]"
          @click="emit('select-equipment', equipment.value)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { EquipmentRestrictions } from '@/lib/Character/Stat'
import { SkillItem } from '@/lib/Skill/SkillComputing'

import SkillEquipmentButton from './skill/skill-equipment-button.vue'

interface Props {
  skillItem: SkillItem
}

interface Emits {
  (event: 'select-equipment', value: EquipmentRestrictions): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const allEquipments = computed(() => {
  const result: Map<string, EquipmentRestrictions> = new Map()
  props.skillItem.effectItems
    .map(effect => effect.equipments)
    .flat()
    .forEach(item => {
      const id = (['main', 'sub', 'body'] as const)
        .map(key => item[key] ?? 'none')
        .join('|')
      if (!result.has(id)) {
        result.set(id, item)
      }
    })
  return [...result.entries()].map(([key, value]) => ({
    id: key,
    value,
  }))
})
</script>
