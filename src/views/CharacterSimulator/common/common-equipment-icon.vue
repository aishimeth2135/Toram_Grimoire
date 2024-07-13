<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <cy-icon :icon="equipment.getCategoryImagePath()" />
</template>
