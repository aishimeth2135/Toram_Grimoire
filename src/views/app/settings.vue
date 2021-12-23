<template>
  <span v-if="storageAvailable" class="app--settings">
    <cy-button-icon icon="ic-baseline-settings" @click="toggleWindowVisible" />
    <cy-modal
      v-model:visible="windowVisible"
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
            v{{ $store.state.main.version }}
          </span>
        </div>
      </template>
      <div
        v-if="serviceWorker.hasUpdate"
        class="p-4 flex items-center justify-center"
      >
        <cy-icon-text icon="mdi-creation" text-color="purple">
          {{ t('app.settings.update.new-version-detected') }}
        </cy-icon-text>
        <cy-button-border
          icon="mdi-coffee-outline"
          class="ml-4"
          @click="swUpdate"
        >
          {{ t('app.settings.update.force-update') }}
        </cy-button-border>
      </div>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ic-round-text-fields" text-color="purple">
            {{ t('app.settings.switch-font.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ t('app.settings.switch-font.caption') }}</div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.switch-font.tips-1') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button-check :selected="currentFont === 1" @click="switchFont(1)">
            {{ t('app.settings.switch-font.default-font') }}
          </cy-button-check>
          <cy-button-check :selected="currentFont === 0" @click="switchFont(0)">
            {{ t('app.settings.switch-font.base-font') }}
          </cy-button-check>
          <cy-button-check :selected="currentFont === 2" @click="switchFont(2)">
            {{ t('app.settings.switch-font.base-font') + '-2' }}
          </cy-button-check>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="mdi-weather-night" text-color="purple">
            {{ t('app.settings.night-mode.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ t('app.settings.night-mode.caption') }}</div>
        <div class="mt-4 mb-2">
          <cy-button-check
            :selected="nightMode === '1'"
            @click="nightMode = nightMode !== '1' ? '1' : '0'"
          >
            {{ t('app.settings.night-mode.title') }}
          </cy-button-check>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="bx-bx-ruler" text-color="purple">
            {{ t('app.settings.set-rem.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">{{ t('app.settings.set-rem.caption') }}</div>
        <div class="flex items-center flex-wrap">
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" class="mr-2" align-v="start">
            {{ t('app.settings.set-rem.tips-1') }}
          </cy-icon-text>
        </div>
        <div class="mt-4 mb-2">
          <cy-input-counter v-model:value="remValue" :range="[120, 200]">
            <template #title>
              <cy-icon-text icon="bx-bx-ruler">
                {{ t('app.settings.set-rem.rem-title') }}
              </cy-icon-text>
            </template>
          </cy-input-counter>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ion-language" text-color="purple">
            {{ t('app.settings.primary-language.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ t('app.settings.primary-language.caption') }}
        </div>
        <div class="flex items-center flex-wrap">
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" class="mr-2" align-v="start">
            {{ t('app.settings.primary-language.tips-1') }}
          </cy-icon-text>
          <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
            {{ t('app.settings.primary-language.tips-2') }}
          </cy-icon-text>
        </div>
        <div class="buttons">
          <cy-button-check
            v-for="(item, i) in languageState.list"
            :key="item"
            :selected="languageState.currentIndex === i"
            @click="setLanguage(0, i)"
          >
            {{ t('app.settings.primary-language.lang-title.' + item) }}
          </cy-button-check>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ion-language" text-color="purple">
            {{ t('app.settings.secondary-language.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ t('app.settings.secondary-language.caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start" class="mr-2">
          {{ t('app.settings.secondary-language.tips-1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.secondary-language.tips-2') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button-check
            v-for="(item, i) in secondLanguageState.list"
            :key="item"
            :selected="secondLanguageState.currentIndex === i"
            @click="setLanguage(1, i)"
          >
            {{ t('app.settings.primary-language.lang-title.' + item) }}
          </cy-button-check>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="carbon-cloud-data-ops" text-color="purple">
            {{ t('app.settings.clear-spreadsheets-caches.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ t('app.settings.clear-spreadsheets-caches.caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.clear-spreadsheets-caches.tips-1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.clear-spreadsheets-caches.tips-2') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.clear-spreadsheets-caches.tips-3') }}
        </cy-icon-text>
        <div class="buttons">
          <cy-button-border icon="ic-round-delete" @click="clearSpreadsheetsCaches">
            {{ t('app.settings.clear-spreadsheets-caches.button-text') }}
          </cy-button-border>
        </div>
      </fieldset>
      <fieldset class="column">
        <legend>
          <cy-icon-text icon="ic-round-save">
            {{ t('app.settings.storage-backup.title') }}
          </cy-icon-text>
        </legend>
        <div class="caption">
          {{ t('app.settings.storage-backup.caption') }}
        </div>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.storage-backup.tips-1') }}
        </cy-icon-text>
        <cy-icon-text icon="bx-bx-error-circle" size="small" text-color="light-3" align-v="start">
          {{ t('app.settings.storage-backup.tips-2') }}
        </cy-icon-text>
        <cy-default-tips v-if="$route.path != '/'" icon="mdi-ghost">
          {{ t('app.settings.storage-backup.restriction-homepage') }}
        </cy-default-tips>
        <div v-else class="buttons">
          <cy-button-border icon="ic-round-save" @click="saveLocalStorage">
            {{ t('app.settings.storage-backup.save') }}
          </cy-button-border>
          <cy-button-border icon="bx-bx-loader-circle" @click="loadLocalStorage">
            {{ t('app.settings.storage-backup.load') }}
          </cy-button-border>
        </div>
      </fieldset>
    </cy-modal>
  </span>
</template>

<script>
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n';

import { APP_STORAGE_KEYS } from '@/shared/consts';
import CY from '@/shared/utils/Cyteria';

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    const list1 = ['auto', '0', '1', '2', '3'],
      list2 = ['0', '1', '2', '3'];
    return {
      windowVisible: false,
      currentFont: localStorage[APP_STORAGE_KEYS.FONT_FAMILY] !== undefined ?
        parseInt(localStorage[APP_STORAGE_KEYS.FONT_FAMILY], 10) : 1,
      setRem: {
        value: localStorage[APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE] ?
          parseInt(localStorage[APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE], 10) : 160,
      },
      setNightMode: {
        value: localStorage[APP_STORAGE_KEYS.NIGHT_MODE] || '0',
      },
      languageState: {
        list: list1,
        currentIndex: list1.indexOf(localStorage[APP_STORAGE_KEYS.LANGUAGE]),
      },
      secondLanguageState: {
        list: list2,
        currentIndex: list2.indexOf(localStorage[APP_STORAGE_KEYS.SECOND_LANGUAGE]),
      },
      update: {
        newVersionDetected: false,
        sw: null,
      },
    };
  },
  computed: {
    ...mapState('main', ['serviceWorker']),
    storageAvailable() {
      return CY.storageAvailable('localStorage');
    },
    nightMode: {
      get() {
        return this.setNightMode.value;
      },
      set(value) {
        this.setNightMode.value = value;
        localStorage[APP_STORAGE_KEYS.NIGHT_MODE] = value;
        document.documentElement.classList.toggle('theme--night-mode', value === '1');
      },
    },
    remValue: {
      get() {
        return this.setRem.value;
      },
      set(value) {
        localStorage.setItem(APP_STORAGE_KEYS.ROOT_ELEMENT_FONT_SIZE, value.toString());
        this.setRem.value = value;
        document.documentElement.style.fontSize = (this.setRem.value / 10).toString() + 'px';
      },
    },
  },
  mounted() {
    const rel = document.documentElement;
    rel.classList.add('font-' + this.currentFont.toString());
    rel.style.fontSize = (this.setRem.value / 10).toString() + 'px';
    rel.classList.toggle('theme--night-mode', this.nightMode === '1');
  },
  methods: {
    async swUpdate() {
      this.$notify.loading.show();
      await this.$nextTick();
      this.serviceWorker.instance.waiting.postMessage({ type: 'SKIP_WAITING' });
    },
    clearSpreadsheetsCaches() {
      caches.delete('google-spreadsheets-csv-files')
        .then(res => res && this.$notify(this.t('app.settings.clear-spreadsheets-caches.success-tips')));
    },
    saveLocalStorage() {
      const data = {};
      const storage = window.localStorage;
      Array(localStorage.length).fill().map((_, i) => i).forEach(idx => {
        const key = storage.key(idx);
        const item = storage.getItem(key);
        if (key.slice(0, 7) !== 'iconify')
          data[key] = item;
      });

      CY.file.save({
        data: JSON.stringify(data),
        fileType: 'text/txt',
        fileName: 'cy-grimoire-storage.txt',
      });

      this.$notify(this.t('app.settings.storage-backup.save-success-tips'));
    },
    loadLocalStorage() {
      const storage = window.localStorage;

      CY.file.load({
        succeed: data => {
          data = JSON.parse(data);
          Object.keys(data).forEach(k => storage.setItem(k, data[k]));
          this.$notify(this.t('app.settings.storage-backup.load-success-tips'));
        },
        error: () => {
          this.$notify(this.t('app.settings.storage-backup.load-failed-tips'));
        },
        checkFileType: type => {
          if (type !== 'txt') {
            this.$notify(this.t('app.settings.storage-backup.wrong-file-type-tips'));
            return false;
          }
          return true;
        },
      });
    },
    setLanguage(target, index) {
      const state = target === 0 ? this.languageState : this.secondLanguageState;
      const key = target === 0 ? APP_STORAGE_KEYS.LANGUAGE : APP_STORAGE_KEYS.SECOND_LANGUAGE;
      state.currentIndex = index;
      localStorage[key] = state.list[index];
    },
    switchFont(id) {
      const origin = localStorage.getItem(APP_STORAGE_KEYS.FONT_FAMILY);
      origin != '0' && document.documentElement.classList.remove('font-' + origin);
      localStorage.setItem(APP_STORAGE_KEYS.FONT_FAMILY, id.toString());
      id != 0 && document.documentElement.classList.add('font-' + id);
      this.currentFont = id;
    },
    toggleWindowVisible() {
      this.windowVisible = !this.windowVisible;
    },
  },
};
</script>

<style lang="postcss" scoped>
.column {
  @apply py-2 px-5 mb-3 border-1 border-solid border-light;

  & > .caption {
    @apply mb-2;
  }
  & > .buttons {
    @apply p-1 mt-1;
  }
  & > legend {
    @apply px-2;
  }
}
</style>
