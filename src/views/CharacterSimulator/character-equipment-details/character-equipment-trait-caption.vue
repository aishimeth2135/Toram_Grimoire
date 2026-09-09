<script lang="ts" setup>
import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

import EquipmentTraitCaption from '@/components/common/equipment-trait-caption.vue'

defineProps<{ traitItem: EquipmentTraitItem }>()
</script>

<template>
  <EquipmentTraitCaption :trait-item="traitItem" />
</template>
