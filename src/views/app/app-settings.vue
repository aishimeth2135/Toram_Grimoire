<template>
  <cy-modal v-model:visible="mainStore.settingVisible" class="main--window" width="wide" footer>
    <template #title>
      <div class="flex items-center">
        <cy-icon-text icon="ic-baseline-settings">
          {{ t('app.settings.title') }}
        </cy-icon-text>
        <span class="ml-auto text-fuchsia-60"> v{{ mainStore.version }} </span>
      </div>
    </template>
    <div v-if="mainStore.serviceWorker.hasUpdate" class="flex items-center justify-center p-4">
      <cy-icon-text icon="mdi-creation" text-color="fuchsia-60">
        {{ t('app.settings.update.new-version-detected') }}
      </cy-icon-text>
      <div class="pl-4">
        <cy-button-action icon="mdi-coffee-outline" @click="swUpdate">
          {{ t('app.settings.update.force-update') }}
        </cy-button-action>
      </div>
    </div>
    <div class="mt-4 space-y-6">
      <AppSettingsRow :title="t('app.settings.switch-font.title')" title-icon="ic-round-text-fields">
        <template #caption>
          {{ t('app.settings.switch-font.caption') }}
        </template>
        <template #actions>
          <cy-button-radio-group v-model:value="appFont" :options="appFontOptions" />
        </template>
      </AppSettingsRow>
      <AppSettingsRow :title="t('app.settings.night-mode.title')" title-icon="mdi-weather-night">
        <template #caption>
          {{ t('app.settings.night-mode.caption') }}
        </template>
        <template #actions>
          <cy-button-toggle v-model:selected="appNightMode">
            {{ t('app.settings.night-mode.title') }}
          </cy-button-toggle>
        </template>
      </AppSettingsRow>
      <AppSettingsRow :title="t('app.settings.set-rem.title')" title-icon="bx-bx-ruler">
        <template #caption>
          {{ t('app.settings.set-rem.caption') }}
        </template>
        <template #caption-sub>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" class="mr-2" align-v="start">
            {{ t('app.settings.set-rem.tips-1') }}
          </cy-icon-text>
        </template>
        <template #actions>
          <cy-input-counter v-model:value="appRem" :range="[120, 200]">
            <template #title>
              <cy-icon-text icon="bx-bx-ruler">
                {{ t('app.settings.set-rem.rem-title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </template>
      </AppSettingsRow>
      <AppSettingsRow :title="t('app.settings.primary-language.title')" title-icon="ion-language">
        <template #caption>
          {{ t('app.settings.primary-language.caption') }}
        </template>
        <template #caption-sub>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" class="mr-2" align-v="start">
            {{ t('app.settings.primary-language.tips-1') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
            {{ t('app.settings.primary-language.tips-2') }}
          </cy-icon-text>
        </template>
        <template #actions>
          <cy-button-radio v-for="(item, idx) in primaryLanguageList" :key="item" :selected="primaryLanguage === idx"
            @click="setLanguage(0, idx)">
            {{ t('app.settings.primary-language.lang-title.' + item) }}
          </cy-button-radio>
        </template>
        <template #extra-rows>
          <AppSettingsRow>
            <template #caption>
              {{ t('app.settings.secondary-language.caption') }}
            </template>
            <template #caption-sub>
              <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start" class="mr-2">
                {{ t('app.settings.secondary-language.tips-1') }}
              </cy-icon-text>
              <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
                {{ t('app.settings.secondary-language.tips-2') }}
              </cy-icon-text>
            </template>
            <template #actions>
              <cy-button-radio v-for="(item, idx) in fallbackLanguageList" :key="item"
                :selected="fallbackLanguage === idx" @click="setLanguage(1, idx)">
                {{ t('app.settings.primary-language.lang-title.' + item) }}
              </cy-button-radio>
            </template>
          </AppSettingsRow>
        </template>
      </AppSettingsRow>
      <AppSettingsRow :title="t('app.settings.clear-spreadsheets-caches.title')" title-icon="carbon-cloud-data-ops">
        <template #caption>
          {{ t('app.settings.clear-spreadsheets-caches.caption') }}
        </template>
        <template #caption-sub>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
            {{ t('app.settings.clear-spreadsheets-caches.tips-1') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
            {{ t('app.settings.clear-spreadsheets-caches.tips-2') }}
          </cy-icon-text>
        </template>
        <template #actions>
          <cy-button-action icon="ic-round-delete" @click="clearSpreadsheetsCaches">
            {{ t('app.settings.clear-spreadsheets-caches.button-text') }}
          </cy-button-action>
        </template>
      </AppSettingsRow>
      <AppSettingsRow :title="t('app.settings.storage-backup.title')" title-icon="ic-round-save">
        <template #caption>
          {{ t('app.settings.storage-backup.caption') }}
        </template>
        <template #caption-sub>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
            {{ t('app.settings.storage-backup.tips-1') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bx-error-circle" small text-color="primary-50" align-v="start">
            {{ t('app.settings.storage-backup.tips-2') }}
          </cy-icon-text>
        </template>
        <template #actions>
          <cy-default-tips v-if="currentRoute.name !== AppRouteNames.Home" icon="mdi-ghost">
            {{ t('app.settings.storage-backup.restriction-homepage') }}
          </cy-default-tips>
          <template v-else>
            <cy-button-action icon="ic-round-save" @click="saveLocalStorage">
              {{ t('app.settings.storage-backup.save') }}
            </cy-button-action>
            <cy-button-action icon="bx-bx-loader-circle" @click="loadLocalStorage">
              {{ t('app.settings.storage-backup.load') }}
            </cy-button-action>
          </template>
        </template>
      </AppSettingsRow>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'
import { useSettingStore } from '@/stores/app/setting'

import { APP_STORAGE_KEYS } from '@/shared/consts/route'
import Notify from '@/shared/setup/Notify'
import CY from '@/shared/utils/Cyteria'

import { AppRouteNames } from '@/router/enums'

import AppSettingsRow from './app-settings/app-settings-row.vue'

defineOptions({
  name: 'AppSettings',
})

const { t } = useI18n()
const { currentRoute } = useRouter()
const mainStore = useMainStore()

const primaryLanguageList = ['auto', '0', '1', '2', '3']
const fallbackLanguageList = ['0', '1', '2', '3']

const _primaryLanguage = ref(
  primaryLanguageList.indexOf(localStorage.getItem(APP_STORAGE_KEYS.PRIMARY_LOCALE) ?? 'auto')
)
const primaryLanguage = computed<number>({
  get() {
    return _primaryLanguage.value
  },
  set(value) {
    _primaryLanguage.value = value
    localStorage.setItem(APP_STORAGE_KEYS.PRIMARY_LOCALE, primaryLanguageList[value])
  },
})

const _fallbackLanguage = ref(
  fallbackLanguageList.indexOf(localStorage.getItem(APP_STORAGE_KEYS.FALLBACK_LOCALE) ?? 'auto')
)
const fallbackLanguage = computed<number>({
  get() {
    return _fallbackLanguage.value
  },
  set(value) {
    _fallbackLanguage.value = value
    localStorage.setItem(APP_STORAGE_KEYS.FALLBACK_LOCALE, fallbackLanguageList[value])
  },
})

const { notify, loading } = Notify()

const swUpdate = async () => {
  loading.show()
  await nextTick()
  mainStore.serviceWorker.update?.(true)
}

const clearSpreadsheetsCaches = () => {
  caches
    .delete('google-spreadsheets-csv-files')
    .then(res => res && notify(t('app.settings.clear-spreadsheets-caches.success-tips')))
}

const saveLocalStorage = () => {
  const data = {} as Record<string, string>
  const storage = window.localStorage
  Array(localStorage.length)
    .fill(null)
    .map((_value, idx) => idx)
    .forEach(idx => {
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
    succeed: data => {
      const jsonData = JSON.parse(data) as Record<string, string>

      // reset
      Array(localStorage.length)
        .fill(null)
        .map((_value, idx) => idx)
        .forEach(idx => {
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

const appFontOptions = [
  {
    text: t('app.settings.switch-font.default-font'),
    value: 1,
  },
  {
    text: t('app.settings.switch-font.base-font'),
    value: 0,
  },
  {
    text: t('app.settings.switch-font.base-font') + '-2',
    value: 2,
  },
]
</script>
