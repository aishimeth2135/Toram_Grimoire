<template>
  <div v-if="currentCharacter" class="space-y-2">
    <CharacterComboItem
      v-for="(combo, index) in currentCharacter.comboBuild.combos"
      :key="combo.instanceId"
      :index="index"
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
    <div class="border-t border-light-3 pt-3">
      <cy-icon-text icon="ic:outline-info" align-v="start" small text-color="light-3">
        {{ t('character-simulator.combo.tips.0') }}
      </cy-icon-text>
      <cy-icon-text icon="ic:outline-info" align-v="start" small text-color="light-3">
        {{ t('character-simulator.combo.tips.1') }}
      </cy-icon-text>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CharacterCombo',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import CharacterComboItem from './character-combo-item.vue'

import { setupCharacterStore } from '../setup'

const { t } = useI18n()
const { currentCharacter } = setupCharacterStore()
</script>
