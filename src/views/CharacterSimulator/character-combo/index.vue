<template>
  <div v-if="currentCharacter" class="divide-y-1 divide-light">
    <CharacterComboItem
      v-for="combo in currentCharacter.comboBuild.combos"
      :key="combo.instanceId"
      :combo="combo"
    />
    <div
      class="h-24 w-full flex items-center justify-center cursor-pointer"
      @click="currentCharacter!.comboBuild.appendCombo()"
    >
      <cy-icon-text
        icon="ic-round-add-circle-outline"
        icon-width="2.5rem"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterCombo',
}
</script>

<script lang="ts" setup>
import CharacterComboItem from './character-combo-item.vue'

import { setupCharacterStore } from '../setup'

const { currentCharacter } = setupCharacterStore()
</script>
