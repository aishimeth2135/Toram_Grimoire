<script lang="ts" setup>
import { CharacterEquipmentEditModes } from './setup'

interface Props {
  mode: CharacterEquipmentEditModes
}
interface Emits {
  (evt: 'edit', mode: CharacterEquipmentEditModes): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <cy-tab :value="mode" class="hover:bg-primary-5/50 w-full" @click="emit('edit', mode)">
    <slot />
  </cy-tab>
</template>
