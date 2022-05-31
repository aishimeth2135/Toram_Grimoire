<template>
  <span v-if="storageAvailable" class="app--settings">
    <cy-button-inline
      icon="ic-baseline-settings"
      @click="(toggle('modals/main'), leftMenuStore.toggleVisible())"
    >
      {{ t('app.settings.title') }}
    </cy-button-inline>
    <cy-modal
      v-model:visible="modals.main"
      class="main--window"
      width="wide"
      footer
    >
      <template #title>
        <div class="flex items-center">
          <cy-icon-text icon="ic-baseline-settings">
            {{ t('app.settings.title') }}
          </cy-icon-text>
          <span class="ml-auto text-purple">
            v{{ mainStore.version }}
          </span>
        </div>
      </template>
      <div
        v-if="mainStore.serviceWorker.hasUpdate"
        class="p-4 flex items-center justify-center"
      >
        <cy-icon-text icon="mdi-creation" text-color="purple">
          {{ t('app.settings.update.new-version-detected') }}
        </cy-icon-text>
        <div class="pl-4">
          <cy-button-action
            icon="mdi-coffee-outline"
            @click="swUpdate"
          >
            {{ t('app.settings.update.force-update') }}
          </cy-button-action>
        </div>
      </div>
      <div class="space-y-2">
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="ic-round-text-fields" text-color="purple">
                {{ t('app.settings.switch-font.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">{{ t('app.settings.switch-font.caption') }}</div>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.switch-font.tips-1') }}
            </cy-icon-text>
            <cy-button-check-group v-model:value="appFont" :options="appFontOptions" class="buttons" />
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="mdi-weather-night" text-color="purple">
                {{ t('app.settings.night-mode.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">{{ t('app.settings.night-mode.caption') }}</div>
            <div class="mt-4 mb-2">
              <cy-button-switch v-model:selected="appNightMode">
                {{ t('app.settings.night-mode.title') }}
              </cy-button-switch>
            </div>
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="bx-bx-ruler" text-color="purple">
                {{ t('app.settings.set-rem.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">{{ t('app.settings.set-rem.caption') }}</div>
            <div class="flex items-center flex-wrap">
              <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" class="mr-2" align-v="start">
                {{ t('app.settings.set-rem.tips-1') }}
              </cy-icon-text>
            </div>
            <div class="mt-4 mb-2">
              <cy-input-counter v-model:value="appRem" :range="[120, 200]">
                <template #title>
                  <cy-icon-text icon="bx-bx-ruler">
                    {{ t('app.settings.set-rem.rem-title') }}
                  </cy-icon-text>
                </template>
              </cy-input-counter>
            </div>
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="ion-language" text-color="purple">
                {{ t('app.settings.primary-language.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">
              {{ t('app.settings.primary-language.caption') }}
            </div>
            <div class="flex items-center flex-wrap">
              <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" class="mr-2" align-v="start">
                {{ t('app.settings.primary-language.tips-1') }}
              </cy-icon-text>
              <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
                {{ t('app.settings.primary-language.tips-2') }}
              </cy-icon-text>
            </div>
            <div class="buttons">
              <cy-button-check
                v-for="(item, idx) in primaryLanguageList"
                :key="item"
                :selected="primaryLanguage === idx"
                @click="setLanguage(0, idx)"
              >
                {{ t('app.settings.primary-language.lang-title.' + item) }}
              </cy-button-check>
            </div>
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="ion-language" text-color="purple">
                {{ t('app.settings.secondary-language.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">
              {{ t('app.settings.secondary-language.caption') }}
            </div>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start" class="mr-2">
              {{ t('app.settings.secondary-language.tips-1') }}
            </cy-icon-text>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.secondary-language.tips-2') }}
            </cy-icon-text>
            <div class="buttons">
              <cy-button-check
                v-for="(item, idx) in fallbackLanguageList"
                :key="item"
                :selected="fallbackLanguage === idx"
                @click="setLanguage(1, idx)"
              >
                {{ t('app.settings.primary-language.lang-title.' + item) }}
              </cy-button-check>
            </div>
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="carbon-cloud-data-ops" text-color="purple">
                {{ t('app.settings.clear-spreadsheets-caches.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">
              {{ t('app.settings.clear-spreadsheets-caches.caption') }}
            </div>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.clear-spreadsheets-caches.tips-1') }}
            </cy-icon-text>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.clear-spreadsheets-caches.tips-2') }}
            </cy-icon-text>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.clear-spreadsheets-caches.tips-3') }}
            </cy-icon-text>
            <div class="buttons">
              <cy-button-action icon="ic-round-delete" @click="clearSpreadsheetsCaches">
                {{ t('app.settings.clear-spreadsheets-caches.button-text') }}
              </cy-button-action>
            </div>
          </fieldset>
        </div>
        <div class="app--settings-column">
          <fieldset>
            <legend>
              <cy-icon-text icon="ic-round-save" text-color="purple">
                {{ t('app.settings.storage-backup.title') }}
              </cy-icon-text>
            </legend>
            <div class="caption">
              {{ t('app.settings.storage-backup.caption') }}
            </div>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.storage-backup.tips-1') }}
            </cy-icon-text>
            <cy-icon-text icon="bx-bx-error-circle" small text-color="light-3" align-v="start">
              {{ t('app.settings.storage-backup.tips-2') }}
            </cy-icon-text>
            <cy-default-tips v-if="$route.path !== '/'" icon="mdi-ghost">
              {{ t('app.settings.storage-backup.restriction-homepage') }}
            </cy-default-tips>
            <div v-else class="buttons">
              <cy-button-action icon="ic-round-save" @click="saveLocalStorage">
                {{ t('app.settings.storage-backup.save') }}
              </cy-button-action>
              <cy-button-action icon="bx-bx-loader-circle" @click="loadLocalStorage">
                {{ t('app.settings.storage-backup.load') }}
              </cy-button-action>
            </div>
          </fieldset>
        </div>
      </div>
    </cy-modal>
  </span>
</template>

<script lang="ts">
export default {
  name: 'AppSetting',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'

import { useMainStore } from '@/stores/app/main'
import { useSettingStore } from '@/stores/app/setting'
import { useLeftMenuStore } from '@/stores/app/left-menu'

import { APP_STORAGE_KEYS } from '@/shared/consts'
import CY from '@/shared/utils/Cyteria'

import ToggleService from '@/setup/ToggleService'
import Notify from '@/setup/Notify'

const { t } = useI18n()
const mainStore = useMainStore()
const leftMenuStore = useLeftMenuStore()

const { modals, toggle } = ToggleService({ modals: ['main'] as const })

const primaryLanguageList = ['auto', '0', '1', '2', '3']
const fallbackLanguageList = ['0', '1', '2', '3']

const _primaryLanguage = ref(primaryLanguageList.indexOf(localStorage.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE) ?? 'auto'))
const primaryLanguage = computed<number>({
  get() {
    return _primaryLanguage.value
  },
  set(value) {
    _primaryLanguage.value = value
    localStorage.setItem(APP_STORAGE_KEYS.PRIMARY_LOCALE, primaryLanguageList[value])
  },
})

const _fallbackLanguage = ref(fallbackLanguageList.indexOf(localStorage.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE) ?? 'auto'))
const fallbackLanguage = computed<number>({
  get() {
    return _fallbackLanguage.value
  },
  set(value) {
    _fallbackLanguage.value = value
    localStorage.setItem(APP_STORAGE_KEYS.FALLBACK_LOCALE, fallbackLanguageList[value])
  },
})

const storageAvailable = CY.storageAvailable('localStorage')
const { notify, loading } = Notify()

const swUpdate = async () => {
  loading.show()
  await nextTick()
  mainStore.serviceWorker.update?.(true)
}

const clearSpreadsheetsCaches = () => {
  caches.delete('google-spreadsheets-csv-files')
    .then(res => res && notify(t('app.settings.clear-spreadsheets-caches.success-tips')))
}

const saveLocalStorage = () => {
  const data = {} as Record<string, string>
  const storage = window.localStorage
  Array(localStorage.length).fill(null).map((value, idx) => idx).forEach(idx => {
    const key = storage.key(idx)!
    const item = storage.getItem(key)!
    if (key.slice(0, 7) !== 'iconify') {
      data[key] = item
    }
  })

  CY.file.save({
    data: JSON.stringify(data),
    fileType: 'text/txt',
    fileName: 'cy-grimoire-storage.txt',
  })

  notify(t('app.settings.storage-backup.save-success-tips'))
}

const loadLocalStorage = () => {
  const storage = window.localStorage

  CY.file.load({
    succeed: (data) => {
      const jsonData = JSON.parse(data) as Record<string, string>

      // reset
      Array(localStorage.length).fill(null).map((value, idx) => idx).forEach(idx => {
        const key = storage.key(idx)
        if (key && !key.startsWith('iconify')) {
          storage.removeItem(key)
        }
      })

      Object.keys(jsonData).forEach(key => storage.setItem(key, jsonData[key]))
      notify(t('app.settings.storage-backup.load-success-tips'))
    },
    error: () => {
      notify(t('app.settings.storage-backup.load-failed-tips'))
    },
    checkFileType: type => {
      if (type !== 'txt') {
        notify(t('app.settings.storage-backup.wrong-file-type-tips'))
        return false
      }
      return true
    },
  })
}

const setLanguage = (target: 0 | 1, index: number) => {
  const state = target === 0 ? primaryLanguage : fallbackLanguage
  const list = target === 0 ? primaryLanguageList : fallbackLanguageList
  const key = target === 0 ? APP_STORAGE_KEYS.PRIMARY_LOCALE : APP_STORAGE_KEYS.FALLBACK_LOCALE
  state.value = index
  localStorage[key] = list[index]
}

const settingStore = useSettingStore()
const { appFont, appRem, appNightMode } = storeToRefs(settingStore)

const appFontOptions = [{
  text: t('app.settings.switch-font.default-font'),
  value: 1,
}, {
  text: t('app.settings.switch-font.base-font'),
  value: 0,
}, {
  text: t('app.settings.switch-font.base-font') + '-2',
  value: 2,
}]
</script>

<style lang="postcss" scoped>
.app--settings-column {
  @apply relative px-0.5;

  &::before {
    content: '';
    @apply absolute right-0 top-1.5 w-3.5 h-3.5 bg-light-2;
  }

  & > fieldset {
    @apply py-2 px-2 border-0 border-t-1 border-solid border-light-2;

    & > .caption {
      @apply mb-2;
    }
    & > .buttons {
      @apply p-1 mt-1;
    }
    & > legend {
      @apply px-2 ml-2;
    }
  }
}
</style>
