<template>
  <div v-if="currentCharacter" class="space-y-2">
    <CharacterComboItem
      v-for="(combo, index) in currentCharacter.comboBuild.combos"
      :key="combo.instanceId"
      :index="index"
      :combo="combo"
    />
    <div
      class="flex h-24 w-full cursor-pointer items-center justify-center"
      @click="currentCharacter!.comboBuild.appendCombo()"
    >
      <cy-icon icon="ic-round-add-circle-outline" width="2.5rem" />
    </div>
    <div class="border-t border-primary-50 pt-3">
      <div class="inline-flex items-start gap-icon text-sm text-primary-50">
        <cy-icon icon="ic:outline-info" small class="icon-first-line text-primary-30" />
        {{ t('character-simulator.combo.tips.0') }}
      </div>
      <div class="inline-flex items-start gap-icon text-sm text-primary-50">
        <cy-icon icon="ic:outline-info" small class="icon-first-line text-primary-30" />
        {{ t('character-simulator.combo.tips.1') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import CharacterComboItem from './character-combo-item.vue'

defineOptions({
  name: 'CharacterCombo',
})

const { t } = useI18n()
const { currentCharacter } = storeToRefs(useCharacterStore())
</script>
