<template>
  <div v-if="storageAvailable">
    <div class="p-4">
      <cy-default-tips icon="mdi:export" text-align="left">
        {{
          t('character-simulator.save-load-control.export-save-data-caption')
        }}
      </cy-default-tips>
      <div class="px-4 pb-2">
        <cy-icon-text small icon="ic:outline-info" text-color="primary-50">
          {{
            t('character-simulator.save-load-control.export-save-data-tips[0]')
          }}
        </cy-icon-text>
      </div>
      <div class="flex items-center pl-3">
        <cy-button-action
          icon="mdi:export"
          @click="toggle('modals/exportSaveData', true)"
        >
          {{
            t('character-simulator.save-load-control.export-save-data-title')
          }}
        </cy-button-action>
        <cy-button-action icon="mdi:import" @click="importSaveData">
          {{ t('global.import') }}
        </cy-button-action>
      </div>
    </div>
    <div class="border-t border-primary-30 p-4">
      <cy-default-tips icon="bx-bx-message-square-dots" text-align="left">
        {{
          t('character-simulator.save-load-control.manual-save-load-caption')
        }}
      </cy-default-tips>
      <div class="pl-3">
        <cy-button-action
          icon="ic-round-save"
          @click="store.saveCharacterSimulator()"
        >
          {{
            t('character-simulator.save-load-control.manual-save-button-title')
          }}
        </cy-button-action>
        <cy-button-action
          icon="bx-bx-loader-circle"
          @click="store.loadCharacterSimulator()"
        >
          {{
            t('character-simulator.save-load-control.manual-load-button-title')
          }}
        </cy-button-action>
      </div>
    </div>
    <div class="border-t border-primary-30 p-4">
      <cy-default-tips icon="mdi-food-apple-outline" text-align="left">
        <div>
          {{
            t('character-simulator.save-load-control.deleta-all-data-caption.0')
          }}
        </div>
        <cy-icon-text
          icon="ic-outline-info"
          text-color="primary-50"
          small
          class="mt-2"
        >
          {{
            t('character-simulator.save-load-control.deleta-all-data-caption.1')
          }}
        </cy-icon-text>
        <cy-icon-text
          icon="ic-outline-info"
          text-color="primary-50"
          small
          class="mt-2"
        >
          {{
            t('character-simulator.save-load-control.deleta-all-data-caption.2')
          }}
        </cy-icon-text>
      </cy-default-tips>
      <div class="pl-3">
        <cy-input-counter v-model:value="deleteCounter">
          <template #title>
            <cy-icon-text icon="ic-round-delete">
              {{
                t(
                  'character-simulator.save-load-control.deleta-all-data-counter-title'
                )
              }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
        <div class="mt-2">
          <cy-button-action
            v-if="deleteCounter === 10"
            icon="ic-round-delete"
            @click="
              store.deleteAllSavedData(),
                notify(
                  t(
                    'character-simulator.save-load-control.deleta-all-data-success-tips'
                  )
                )
            "
          >
            {{
              t('character-simulator.save-load-control.deleta-all-data-title')
            }}
          </cy-button-action>
        </div>
      </div>
    </div>
    <CharacterSaveExport
      :visible="modals.exportSaveData"
      @close="toggle('modals/exportSaveData', false)"
    />
  </div>
  <cy-default-tips v-else icon="mdi-ghost">
    {{ t('app.features.localStorage-inavailable-tips') }}
  </cy-default-tips>
</template>

<script lang="ts">
export default {
  name: 'CharacterSave',
}
</script>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  CharacterSimulatorSaveData,
  useCharacterStore,
} from '@/stores/views/character'

import CY from '@/shared/utils/Cyteria'
import Cyteria from '@/shared/utils/Cyteria'

import Notify from '@/setup/Notify'
import ToggleService from '@/setup/ToggleService'

import CharacterSaveExport from './character-save-export.vue'

const deleteCounter = ref(0)

const { t } = useI18n()
const { notify } = Notify()
const store = useCharacterStore()
const { modals, toggle } = ToggleService({
  modals: ['exportSaveData'] as const,
})

const storageAvailable = CY.storageAvailable('localStorage')

const importSaveData = () => {
  Cyteria.file.load({
    succeed: res => {
      try {
        const data = JSON.parse(res) as CharacterSimulatorSaveData
        store.loadCharacterSimulatorSaveData(data)
        notify(t('common.export-build.load-success-tips'))
      } catch (error) {
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
