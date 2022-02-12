<template>
  <div v-if="storageAvailable">
    <div class="p-4">
      <cy-default-tips icon="bx-bx-message-square-dots" text-align="left">
        {{ t('character-simulator.save-load-control.manual-save-load-caption') }}
      </cy-default-tips>
      <div class="pl-3">
        <cy-button-border
          icon="ic-round-save"
          @click="store.saveCharacterSimulator()"
        >
          {{ t('character-simulator.save-load-control.manual-save-button-title') }}
        </cy-button-border>
        <cy-button-border
          icon="bx-bx-loader-circle"
          @click="store.loadCharacterSimulator()"
        >
          {{ t('character-simulator.save-load-control.manual-load-button-title') }}
        </cy-button-border>
      </div>
    </div>
    <div class="p-4 border-t border-light-2">
      <cy-default-tips icon="mdi-food-apple-outline" text-align="left">
        <div>{{ t('character-simulator.save-load-control.deleta-all-data-caption.0') }}</div>
        <cy-icon-text icon="ic-outline-info" text-color="light-3" size="small" class="mt-2">
          {{ t('character-simulator.save-load-control.deleta-all-data-caption.1') }}
        </cy-icon-text>
        <cy-icon-text icon="ic-outline-info" text-color="light-3" size="small" class="mt-2">
          {{ t('character-simulator.save-load-control.deleta-all-data-caption.2') }}
        </cy-icon-text>
      </cy-default-tips>
      <div class="pl-3">
        <cy-input-counter v-model:value="deleteCounter">
          <template #title>
            <cy-icon-text icon="ic-round-delete">
              {{ t('character-simulator.save-load-control.deleta-all-data-counter-title') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-button-border
          v-if="deleteCounter === 10"
          icon="ic-round-delete"
          style="margin-top: 0.6rem;"
          @click="store.deleteAllSavedData()"
        >
          {{ t('character-simulator.save-load-control.deleta-all-data-title') }}
        </cy-button-border>
      </div>
    </div>
  </div>
  <cy-default-tips v-else icon="mdi-ghost">
    {{ t('app.features.localStorage-inavailable-tips') }}
  </cy-default-tips>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import CY from '@/shared/utils/Cyteria'

const deleteCounter = ref(0)

const { t } = useI18n()
const store = useCharacterStore()

const storageAvailable = CY.storageAvailable('localStorage')
</script>

