<template>
  <div v-if="storageAvailable" class="space-y-3">
    <CharacterSaveRow icon="mdi:export">
      <div>
        {{ t('character-simulator.save-load-control.export-save-data-caption') }}
      </div>
      <div class="py-2">
        <div class="gap-icon text-primary-50 inline-flex items-center text-sm">
          <cy-icon icon="ic:outline-info" small class="text-primary-30" />
          {{ t('character-simulator.save-load-control.export-save-data-tips[0]') }}
        </div>
      </div>
      <div class="flex items-center py-2">
        <cy-button-action icon="mdi:export" @click="toggleExportSaveDataVisible(true)">
          {{ t('character-simulator.save-load-control.export-save-data-title') }}
        </cy-button-action>
        <cy-button-action icon="mdi:import" @click="importSaveData">
          {{ t('global.import') }}
        </cy-button-action>
      </div>
    </CharacterSaveRow>
    <CharacterSaveRow icon="bx-bx-message-square-dots">
      <div>
        {{ t('character-simulator.save-load-control.manual-save-load-caption') }}
      </div>
      <div class="pb-2 pt-4">
        <cy-button-action icon="ic-round-save" @click="store.saveCharacterSimulator()">
          {{ t('character-simulator.save-load-control.manual-save-button-title') }}
        </cy-button-action>
        <cy-button-action icon="bx-bx-loader-circle" @click="store.loadCharacterSimulator()">
          {{ t('character-simulator.save-load-control.manual-load-button-title') }}
        </cy-button-action>
      </div>
    </CharacterSaveRow>
    <CharacterSaveRow icon="mdi-food-apple-outline">
      <div>
        {{ t('character-simulator.save-load-control.deleta-all-data-caption.0') }}
      </div>
      <div class="py-2">
        <div class="gap-icon text-primary-50 mt-2 inline-flex items-center text-sm">
          <cy-icon icon="ic-outline-info" small class="text-primary-30" />
          {{ t('character-simulator.save-load-control.deleta-all-data-caption.1') }}
        </div>
        <div class="gap-icon text-primary-50 mt-2 inline-flex items-center text-sm">
          <cy-icon icon="ic-outline-info" small class="text-primary-30" />
          {{ t('character-simulator.save-load-control.deleta-all-data-caption.2') }}
        </div>
      </div>
      <div class="py-2">
        <cy-input-counter v-model:value="deleteCounter">
          <template #title>
            <div class="gap-icon text-primary-90 inline-flex items-center">
              <cy-icon icon="ic-round-delete" class="text-primary-30" />
              {{ t('character-simulator.save-load-control.deleta-all-data-counter-title') }}
            </div>
          </template>
        </cy-input-counter>
        <div class="mt-2">
          <cy-button-action
            v-if="deleteCounter === 10"
            icon="ic-round-delete"
            @click="
              (store.deleteAllSavedData(),
              notify(t('character-simulator.save-load-control.deleta-all-data-success-tips')))
            "
          >
            {{ t('character-simulator.save-load-control.deleta-all-data-title') }}
          </cy-button-action>
        </div>
      </div>
    </CharacterSaveRow>
    <CharacterSaveExport :visible="exportSaveDataVisible" @close="toggleExportSaveDataVisible" />
  </div>
  <cy-default-tips v-else icon="mdi-ghost">
    {{ t('app.features.localStorage-inavailable-tips') }}
  </cy-default-tips>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { type CharacterSimulatorSaveData, useCharacterStore } from '@/stores/views/character'

import { useNotify } from '@/shared/composables/Notify'
import { useToggle } from '@/shared/composables/State'
import CY from '@/shared/utils/Cyteria'
import Cyteria from '@/shared/utils/Cyteria'

import CharacterSaveExport from './character-save-export.vue'
import CharacterSaveRow from './character-save-row.vue'

defineOptions({
  name: 'CharacterSave',
})

const deleteCounter = ref(0)

const { t } = useI18n()
const notify = useNotify()
const store = useCharacterStore()

const exportSaveDataVisible = ref(false)
const toggleExportSaveDataVisible = useToggle(exportSaveDataVisible)

const storageAvailable = CY.storageAvailable('localStorage')

const importSaveData = () => {
  Cyteria.file.load({
    succeed: res => {
      try {
        const data = JSON.parse(res) as CharacterSimulatorSaveData
        store.loadCharacterSimulatorSaveData(data)
        notify(t('common.export-build.load-success-tips'))
      } catch (_error) {
        notify(t('common.export-build.load-failed-tips'))
      }
    },
    error: () => notify(t('common.export-build.load-unknown-error-tips')),
    checkFileType: fileType => {
      if (fileType !== 'txt') {
        notify(t('common.export-build.load-wrong-file-type-tips'))
        return false
      }
      return true
    },
  })
}
</script>
