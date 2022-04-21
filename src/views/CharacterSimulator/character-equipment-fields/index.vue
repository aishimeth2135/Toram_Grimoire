<template>
  <section>
    <div v-if="currentCharacter" class="flex items-start justify-center" style="min-width: 24.5rem">
      <div class="inline-flex flex-start items-start flex-wrap">
        <CharacterEquipmentField
          v-for="field in currentCharacter.equipmentFields"
          :key="`${field.type}-${field.index}`"
          :equipment-field="field"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'CharacterEquipmentFields',
}
</script>

<script lang="ts" setup>
import CharacterEquipmentField from './character-equipment-field.vue'

import { setupCharacterStore } from '../setup'

const { currentCharacter } = setupCharacterStore()
</script>
